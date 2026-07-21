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
import { estimatePurchaseTax } from "../src/lib/mortgageMath";
import { SINGLE_HOME_BRACKETS, INVESTMENT_BRACKETS, NEW_IMMIGRANT_BRACKETS } from "../src/lib/purchaseTaxRates";
import {
  computeBreakEvenRent,
  computeCashOnCashReturn,
  computeDscr,
  computeRentalCashFlow,
} from "../src/lib/investorMath";

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

console.log("\n[11] Oleh purchase tax benefit is never worse than a regular resident's, at prices real buyers actually pay");
{
  for (const price of [1_500_000, 2_000_000, 2_500_000, 3_000_000, 4_500_000, 7_000_000]) {
    const regular = estimatePurchaseTax(price, "israeli", "firstHome");
    const oleh = estimatePurchaseTax(price, "oleh", "firstHome");
    check(
      `oleh tax at ${price} (${oleh.toFixed(0)}) is never above regular (${regular.toFixed(0)})`,
      oleh <= regular + 1e-6
    );
  }
  // With the July 2026 verified NEW_IMMIGRANT_BRACKETS (0.5% from shekel
  // one, no 0% floor of its own), the oleh schedule is actually worse than
  // the regular resident schedule at ordinary first-time-buyer prices
  // like 2,000,000, since a regular resident's 0% exemption band still
  // beats a flat 0.5% there; the Math.min in estimatePurchaseTax is what
  // protects the buyer in that range (see [11] above; oleh <= regular
  // always holds). The real benefit only shows up once regular's climb
  // through the 3.5%/5%/8% brackets outpaces oleh's flat 0.5%/5%, which
  // the math below places at roughly 6,554,991. Test above and below
  // that crossover, not at an arbitrary "common" price, so this doesn't
  // silently break again if the brackets are ever re-verified and shift.
  const belowCrossover = estimatePurchaseTax(6_000_000, "israeli", "firstHome");
  const olehBelowCrossover = estimatePurchaseTax(6_000_000, "oleh", "firstHome");
  check(
    `below the crossover (6,000,000), regular resident schedule still wins (regular=${belowCrossover.toFixed(0)} <= oleh=${olehBelowCrossover.toFixed(0)})`,
    belowCrossover <= olehBelowCrossover
  );
  const regularAbove = estimatePurchaseTax(7_000_000, "israeli", "firstHome");
  const olehAbove = estimatePurchaseTax(7_000_000, "oleh", "firstHome");
  check(
    `above the crossover (7,000,000), oleh benefit is visibly lower than regular (${olehAbove.toFixed(0)} < ${regularAbove.toFixed(0)})`,
    olehAbove < regularAbove
  );
}

/** Mirrors the private applyBrackets in mortgageMath.ts, kept independent here on purpose. */
function applyBracketsForTest(price: number, brackets: { upTo: number; rate: number }[]): number {
  let tax = 0;
  let floor = 0;
  for (const bracket of brackets) {
    if (price <= floor) break;
    const taxable = Math.min(price, bracket.upTo) - floor;
    tax += taxable * bracket.rate;
    floor = bracket.upTo;
  }
  return tax;
}

console.log("\n[12] Purchase tax brackets are genuinely marginal (continuous at boundaries), not whole-amount-at-top-rate");
{
  const tables: Array<[string, { upTo: number; rate: number }[]]> = [
    ["SINGLE_HOME_BRACKETS", SINGLE_HOME_BRACKETS],
    ["INVESTMENT_BRACKETS", INVESTMENT_BRACKETS],
    ["NEW_IMMIGRANT_BRACKETS", NEW_IMMIGRANT_BRACKETS],
  ];
  for (const [name, brackets] of tables) {
    for (const bracket of brackets) {
      if (!Number.isFinite(bracket.upTo)) continue;
      const b = bracket.upTo;
      const below = applyBracketsForTest(b - 1, brackets);
      const above = applyBracketsForTest(b + 1, brackets);
      // A genuinely marginal calculation changes by at most a few NIS per
      // 2 NIS of price near a boundary; a "whole amount taxed at the new
      // top rate" bug would jump by tens of thousands of NIS instead.
      check(
        `${name} continuous across boundary ${b} (below=${below.toFixed(2)} above=${above.toFixed(2)})`,
        Math.abs(above - below) < 10
      );
    }
  }

  // Hand-computed spot check: at 7,000,000 (israeli, firstHome), each
  // portion of the price should be taxed at its own bracket's rate.
  const expectedAt7m =
    (2_347_040 - 1_978_745) * 0.035 +
    (6_055_070 - 2_347_040) * 0.05 +
    (7_000_000 - 6_055_070) * 0.08;
  const actualAt7m = estimatePurchaseTax(7_000_000, "israeli", "firstHome");
  check(
    `single-home tax at 7,000,000 matches hand-computed marginal total (got=${actualAt7m.toFixed(2)} want=${expectedAt7m.toFixed(2)})`,
    close(actualAt7m, expectedAt7m, 1e-6)
  );

  // A flat "whole amount at 8%" bug would give 560,000 here, over double
  // the real marginal total, this guards against exactly that regression.
  check(
    "single-home tax at 7,000,000 is nowhere near a flat top-rate calculation",
    actualAt7m < 7_000_000 * 0.08 * 0.6
  );
}

console.log("\n[13] Investor math: rental cash flow, cash on cash return, break even rent, DSCR");
{
  const monthlyRent = 10_000;
  const monthlyMortgagePayment = 6_000;
  const propertyPrice = 2_000_000;
  const costs = {
    buildingInsuranceAnnual: 1_200,
    useManagementCompany: true,
    managementFeePct: 10,
    maintenancePct: 5,
    vacancyMonths: 0,
  };

  const flow = computeRentalCashFlow(monthlyRent, monthlyMortgagePayment, propertyPrice, costs);
  check("building insurance monthly = annual/12", close(flow.buildingInsuranceMonthly, 100, 1e-9));
  check("management fee monthly = 10% of rent", close(flow.managementFeeMonthly, 1_000, 1e-9));
  check("maintenance monthly = 5% of rent", close(flow.maintenanceMonthly, 500, 1e-9));
  check("recurring monthly costs sum correctly", close(flow.recurringMonthlyCosts, 1_600, 1e-9));
  check("net monthly cash flow = rent - payment - recurring costs", close(flow.netMonthlyCashFlow, 2_400, 1e-9));
  check("gross annual yield = 6%", close(flow.grossAnnualYieldPct, 0.06, 1e-9));
  check("net annual yield = 5.04%", close(flow.netAnnualYieldPct, 0.0504, 1e-9));

  const cashOnCash = computeCashOnCashReturn(flow.netMonthlyCashFlow, 500_000);
  check("cash on cash return = 5.76%", close(cashOnCash, 0.0576, 1e-9));

  const breakEven = computeBreakEvenRent(monthlyMortgagePayment, flow.recurringMonthlyCosts);
  check("break even rent = payment + recurring costs", close(breakEven, 7_600, 1e-9));

  const dscr = computeDscr(monthlyRent, monthlyMortgagePayment);
  check("DSCR = rent / payment", close(dscr, 10_000 / 6_000, 1e-9));
  check("DSCR = 0 when payment is 0 (never divides by zero)", computeDscr(monthlyRent, 0) === 0);

  const withVacancy = computeRentalCashFlow(monthlyRent, monthlyMortgagePayment, propertyPrice, {
    ...costs,
    vacancyMonths: 2,
  });
  check(
    "2 vacant months reduces effective rent by 2/12 of monthly rent",
    close(withVacancy.vacancyLossMonthly, (monthlyRent * 2) / 12, 1e-9)
  );
  check(
    "net cash flow with vacancy is lower than without",
    withVacancy.netMonthlyCashFlow < flow.netMonthlyCashFlow
  );
  check(
    "cash on cash return is never NaN/Infinity when no cash was invested",
    Number.isFinite(computeCashOnCashReturn(flow.netMonthlyCashFlow, 0))
  );
}

console.log(failures === 0 ? "\nAll engine invariants hold." : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
