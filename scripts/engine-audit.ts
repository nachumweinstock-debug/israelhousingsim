/**
 * Engine invariant audit, run with `npm run test:engine`.
 *
 * These are mathematical invariants the engine must satisfy, not snapshot
 * tests: month-by-month simulation must agree with the closed-form Spitzer
 * formulas, reset tracks must be self-consistent with the flat schedule when
 * nothing actually changes at the reset, and edge cases (zero rate, zero
 * income, equity >= price, age near the cap) must not produce NaN/Infinity.
 */
import { spitzerPayment, remainingBalance, totalInterestFlat } from "../src/engine/amortization";
import { computeTrackResult } from "../src/engine/calc";
import { getTrack } from "../src/engine/tracks";
import { computeMixResult } from "../src/engine/mix";
import { basketToMix } from "../src/engine/baskets";
import { effectiveTermYears } from "../src/engine/validation";
import { RULE_SET } from "../src/engine/rules";
import type { Allocation, Assumptions, BorrowerProfile } from "../src/types";
import { estimatePurchaseTax, isValidIsraeliId } from "../src/lib/mortgageMath";

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    console.log(`  PASS  ${name}`);
  } else {
    failures++;
    console.error(`  FAIL  ${name}${detail ? `, ${detail}` : ""}`);
  }
}
function close(a: number, b: number, tol = 0.01): boolean {
  return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
}

const P = 1_000_000;
const RATE = 0.055;
const N = 360;

console.log("\n[1] Spitzer closed form vs month-by-month simulation");
{
  const pay = spitzerPayment(P, RATE, N);
  let balance = P;
  for (let m = 0; m < N; m++) {
    balance += balance * (RATE / 12) - pay;
  }
  check("final balance amortizes to ~0", Math.abs(balance) < 1, `residual=${balance.toFixed(4)}`);

  let simBalance = P;
  for (let m = 0; m < 120; m++) {
    simBalance += simBalance * (RATE / 12) - pay;
  }
  const formula = remainingBalance(P, RATE, N, 120);
  check("remainingBalance matches simulation at month 120", close(simBalance, formula, 1e-9), `sim=${simBalance.toFixed(2)} formula=${formula.toFixed(2)}`);
}

console.log("\n[2] Zero-rate degenerate case");
{
  check("spitzer at 0% = principal/months", spitzerPayment(1200, 0, 12) === 100);
  check("total interest at 0% = 0", totalInterestFlat(1200, 0, 12) === 0);
  check("remainingBalance at 0% linear", remainingBalance(1200, 0, 12, 6) === 600);
}

const baseAssumptions: Assumptions = { cpiAnnual: 0.03, stressShockPoints: 2 };
const fullAlloc = (trackId: string, rate?: number): Allocation => ({
  trackId,
  percent: 100,
  annualRate: rate ?? getTrack(trackId).defaultAnnualRate,
});

console.log("\n[3] Unlinked 5yr-reset self-consistency (no shock, no CPI => identical to flat schedule)");
{
  const track = getTrack("variable_unlinked_reset5");
  const alloc = fullAlloc("variable_unlinked_reset5");
  const r = computeTrackResult(track, alloc, P, N, 30, { cpiAnnual: 0, stressShockPoints: 0 });
  const flat = totalInterestFlat(P, alloc.annualRate, N);
  check("baseline interest == flat schedule", close(r.totalInterestBaseline, flat, 1e-6), `got=${r.totalInterestBaseline.toFixed(2)} flat=${flat.toFixed(2)}`);
  check("stressed == baseline when shock=0", close(r.totalInterestStressed, r.totalInterestBaseline, 1e-9));
  check("stressed payment == today's payment when shock=0", close(r.paymentStressed, r.paymentToday, 1e-9));
}

console.log("\n[4] Baseline of reset track unaffected by shock parameter");
{
  const track = getTrack("variable_unlinked_reset5");
  const alloc = fullAlloc("variable_unlinked_reset5");
  const noShock = computeTrackResult(track, alloc, P, N, 30, { cpiAnnual: 0, stressShockPoints: 0 });
  const shocked = computeTrackResult(track, alloc, P, N, 30, { cpiAnnual: 0, stressShockPoints: 3 });
  check("baseline interest identical with/without shock", close(noShock.totalInterestBaseline, shocked.totalInterestBaseline, 1e-9));
  check("stressed interest strictly higher under shock", shocked.totalInterestStressed > shocked.totalInterestBaseline);
  check("stressed payment strictly higher under shock", shocked.paymentStressed > shocked.paymentToday);
}

console.log("\n[5] Prime: shock applies immediately across full term");
{
  const track = getTrack("prime");
  const alloc = fullAlloc("prime");
  const r = computeTrackResult(track, alloc, P, N, 30, { cpiAnnual: 0.03, stressShockPoints: 2 });
  const expected = spitzerPayment(P, alloc.annualRate + 0.02, N);
  check("stressed payment == spitzer(rate+shock, full term)", close(r.paymentStressed, expected, 1e-9), `got=${r.paymentStressed.toFixed(2)} want=${expected.toFixed(2)}`);
  check("prime unaffected by CPI (unlinked)", close(r.paymentToday, spitzerPayment(P, alloc.annualRate, N), 1e-9));
}

console.log("\n[6] Fixed CPI-linked: collapses to unlinked behavior at CPI=0, grows monotonically with CPI");
{
  const track = getTrack("fixed_linked");
  const alloc = fullAlloc("fixed_linked");
  const zero = computeTrackResult(track, alloc, P, N, 30, { cpiAnnual: 0, stressShockPoints: 2 });
  const flat = totalInterestFlat(P, alloc.annualRate, N);
  check("CPI=0: stressed payment == today's payment", close(zero.paymentStressed, zero.paymentToday, 1e-9));
  check("CPI=0: total interest == flat schedule", close(zero.totalInterestBaseline, flat, 1e-6));
  const low = computeTrackResult(track, alloc, P, N, 30, { cpiAnnual: 0.02, stressShockPoints: 2 });
  const high = computeTrackResult(track, alloc, P, N, 30, { cpiAnnual: 0.04, stressShockPoints: 2 });
  check("total cost monotonic in CPI", high.totalInterestBaseline > low.totalInterestBaseline && low.totalInterestBaseline > zero.totalInterestBaseline);
  check("no rate shock leaks into fixed track", close(high.totalInterestStressed, high.totalInterestBaseline, 1e-9));
}

console.log("\n[7] Allocation linearity: 50% allocation = half the 100% figures");
{
  const track = getTrack("fixed_unlinked");
  const full = computeTrackResult(track, fullAlloc("fixed_unlinked"), P, N, 30, baseAssumptions);
  const half = computeTrackResult(track, { ...fullAlloc("fixed_unlinked"), percent: 50 }, P, N, 30, baseAssumptions);
  check("half allocation halves payment", close(half.paymentToday * 2, full.paymentToday, 1e-9));
  check("half allocation halves interest", close(half.totalInterestBaseline * 2, full.totalInterestBaseline, 1e-9));
}

const profile: BorrowerProfile = {
  propertyPrice: 2_000_000,
  ownEquity: 500_000,
  buyerCategory: "first_home",
  monthlyNetIncome: 20_000,
  olderBorrowerAge: 35,
  existingMonthlyDebt: 0,
  requestedTermYears: 30,
};

console.log("\n[8] Basket 1 through the mix engine == single fixed track directly");
{
  const result = computeMixResult(basketToMix("basket1"), profile, { cpiAnnual: 0.03, stressShockPoints: 2 }, RULE_SET);
  const rate = getTrack("fixed_unlinked").defaultAnnualRate;
  const expectedPay = spitzerPayment(1_500_000, rate, 360);
  check("payment matches direct spitzer", close(result.paymentToday, expectedPay, 1e-9));
  check("all-fixed basket immune to stress", close(result.paymentStressed, result.paymentToday, 1e-9));
  check("interest matches flat schedule", close(result.totalInterestBaseline, totalInterestFlat(1_500_000, rate, 360), 1e-6));
}

console.log("\n[9] Edge cases: no NaN/Infinity ever");
{
  const richProfile = { ...profile, ownEquity: 2_500_000 }; // equity > price
  const r1 = computeMixResult(basketToMix("basket2"), richProfile, baseAssumptions, RULE_SET);
  check("equity>price: loan 0, payment 0, finite", r1.loanAmount === 0 && r1.paymentToday === 0 && Number.isFinite(r1.pti));

  const brokeProfile = { ...profile, monthlyNetIncome: 0 };
  const r2 = computeMixResult(basketToMix("basket2"), brokeProfile, baseAssumptions, RULE_SET);
  check("zero income: PTI finite (0, not Infinity)", Number.isFinite(r2.pti) && r2.pti === 0);

  const oldProfile = { ...profile, olderBorrowerAge: 79 };
  check("age 79: effective term clamps to 1yr", effectiveTermYears(oldProfile, RULE_SET) === 1);
  const r3 = computeMixResult(basketToMix("basket2"), oldProfile, baseAssumptions, RULE_SET);
  check("1yr term produces finite results", Number.isFinite(r3.paymentToday) && r3.paymentToday > 0);
}

console.log("\n[10] Regulatory boundary conditions");
{
  const atCap = computeMixResult(basketToMix("basket2"), profile, baseAssumptions, RULE_SET);
  check("LTV exactly at 75% cap passes", atCap.checks.find((c) => c.id === "ltv")?.status === "pass");
  const overCap = computeMixResult(
    basketToMix("basket2"),
    { ...profile, ownEquity: 400_000 },
    baseAssumptions,
    RULE_SET
  );
  check("LTV over cap fails", overCap.checks.find((c) => c.id === "ltv")?.status === "fail");
  check("basket2 fixed share ~1/3 passes minimum", atCap.checks.find((c) => c.id === "fixed_share")?.status === "pass");
}

console.log("\n[11] Teudat zehut check digit, correctness so real users never get falsely rejected");
{
  // Derives the correct 9th check digit for any 8 digit prefix using the
  // same weighting rule as isValidIsraeliId, so we can generate real
  // passing numbers without depending on a hardcoded "known good" ID from
  // an external source we have no way to verify here.
  function deriveCheckDigit(prefix8: string): number {
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      const weighted = Number(prefix8[i]) * ((i % 2) + 1);
      sum += weighted > 9 ? weighted - 9 : weighted;
    }
    return (10 - (sum % 10)) % 10;
  }

  const prefixes = ["20345846", "00000001", "12345678", "99999999", "40312200", "00300123"];
  for (const prefix of prefixes) {
    const id = prefix + deriveCheckDigit(prefix);
    check(`derived check digit accepted: ${id}`, isValidIsraeliId(id));
    const tampered = prefix + String((deriveCheckDigit(prefix) + 1) % 10);
    check(`tampering the check digit is rejected: ${tampered}`, !isValidIsraeliId(tampered));
  }

  // A real ID is often written without its leading zeros, both forms must
  // validate identically once padded, or short real numbers get falsely
  // rejected.
  const shortPrefix = "1234567";
  const shortId = shortPrefix + deriveCheckDigit("0" + shortPrefix);
  check("unpadded 8 digit id validates", isValidIsraeliId(shortId));
  check("same id, manually zero padded to 9, also validates", isValidIsraeliId("0" + shortId));

  check("demo bypass 111111111 always accepted", isValidIsraeliId("111111111"));
  check("empty string rejected", !isValidIsraeliId(""));
  check("non numeric rejected", !isValidIsraeliId("abcdefghi"));
  check("10 digits rejected", !isValidIsraeliId("1234567890"));
}

console.log("\n[12] Oleh purchase tax benefit is never worse than a regular resident's, at prices real buyers actually pay");
{
  for (const price of [1_500_000, 2_000_000, 2_500_000, 3_000_000, 4_500_000, 7_000_000]) {
    const regular = estimatePurchaseTax(price, "israeli", "firstHome");
    const oleh = estimatePurchaseTax(price, "oleh", "firstHome");
    check(
      `oleh tax at ${price} (${oleh.toFixed(0)}) is never above regular (${regular.toFixed(0)})`,
      oleh <= regular + 1e-6
    );
  }
  // At a typical first time buyer price, the benefit must actually show up,
  // not just tie the regular schedule, or the oleh branch is invisible.
  const regularAt2m = estimatePurchaseTax(2_000_000, "israeli", "firstHome");
  const olehAt2m = estimatePurchaseTax(2_000_000, "oleh", "firstHome");
  check(
    `oleh benefit is visibly lower than regular at a common 2,000,000 price (${olehAt2m.toFixed(0)} < ${regularAt2m.toFixed(0)})`,
    olehAt2m < regularAt2m
  );
}

console.log(failures === 0 ? "\nAll engine invariants hold." : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
