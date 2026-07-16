import type { Allocation, Track, TrackResult, Assumptions } from "../types";
import { remainingBalance, spitzerPayment, totalInterestFlat } from "./amortization";

/**
 * Per-track result computation.
 *
 * Design note (see spec section 5 and the in-app "simplified projection"
 * disclaimer): this engine distinguishes two dimensions that are easy to
 * conflate —
 *
 *  - CPI drift is a *base planning assumption*, not a stress toggle. It's
 *    applied identically whether we're computing the "baseline" or "stress"
 *    scenario, because indexed principal grows with inflation regardless of
 *    what interest rates do.
 *  - The stress-test rate shock is the one thing that actually differs
 *    between baseline and stress. It only touches variable/reset-eligible
 *    tracks (prime + the two 5-year-reset tracks), never fixed tracks.
 *
 * That keeps the baseline-vs-stress gap isolated to *rate risk* specifically,
 * which is what section 5.4 says is the most useful thing to show.
 */

function fixedUnlinkedResult(
  track: Track,
  amount: number,
  rate: number,
  termMonths: number
): TrackResult {
  const paymentToday = spitzerPayment(amount, rate, termMonths);
  const totalInterest = totalInterestFlat(amount, rate, termMonths);
  return {
    trackId: track.id,
    allocationAmount: amount,
    paymentToday,
    paymentStressed: paymentToday, // fixed unindexed never changes
    totalInterestBaseline: totalInterest,
    totalInterestStressed: totalInterest,
  };
}

function fixedLinkedResult(
  track: Track,
  amount: number,
  realRate: number,
  termMonths: number,
  termYears: number,
  cpiAnnual: number
): TrackResult {
  const paymentToday = spitzerPayment(amount, realRate, termMonths);
  // Projected nominal payment at the end of the term, from CPI compounding alone.
  const paymentAtHorizon = paymentToday * Math.pow(1 + cpiAnnual, termYears);
  // Midpoint approximation for total interest across the life of the loan,
  // per spec 5.2: compound CPI across half the term rather than the full
  // term, since the balance grows gradually rather than jumping immediately.
  const avgPayment = paymentToday * Math.pow(1 + cpiAnnual, termYears / 2);
  const totalInterest = avgPayment * termMonths - amount;
  return {
    trackId: track.id,
    allocationAmount: amount,
    paymentToday,
    paymentStressed: paymentAtHorizon,
    totalInterestBaseline: totalInterest,
    totalInterestStressed: totalInterest, // CPI applies in both; no rate shock on fixed tracks
  };
}

/**
 * Generalized variable/reset-eligible track: covers prime (resetIntervalYears
 * = 0, i.e. can reprice at any time) and the two 5-year-reset tracks, with an
 * optional CPI-linked flag for the indexed variable track.
 */
function variableResetResult(
  track: Track,
  amount: number,
  rate: number,
  termMonths: number,
  isLinked: boolean,
  resetIntervalYears: number,
  cpiAnnual: number,
  shockPoints: number
): TrackResult {
  const resetMonths = Math.min(Math.max(resetIntervalYears, 0) * 12, termMonths);
  const remainingMonths = termMonths - resetMonths;

  const paymentToday = spitzerPayment(amount, rate, termMonths);
  const realBalanceAtReset = remainingBalance(amount, rate, termMonths, resetMonths);
  const cpiGrowthToReset = isLinked ? Math.pow(1 + cpiAnnual, resetMonths / 12) : 1;
  const nominalBalanceAtReset = realBalanceAtReset * cpiGrowthToReset;

  // Interest attributed to the pre-reset segment (real terms; resetMonths=0 -> 0).
  const preResetInterest =
    resetMonths > 0 ? paymentToday * resetMonths - (amount - realBalanceAtReset) : 0;

  if (remainingMonths <= 0) {
    // Reset interval never actually arrives within this loan's term.
    const totalInterest = totalInterestFlat(amount, rate, termMonths);
    return {
      trackId: track.id,
      allocationAmount: amount,
      paymentToday,
      paymentStressed: paymentToday,
      totalInterestBaseline: totalInterest,
      totalInterestStressed: totalInterest,
    };
  }

  const shockDecimal = shockPoints / 100;
  const paymentAtResetBaseline = spitzerPayment(nominalBalanceAtReset, rate, remainingMonths);
  const paymentAtResetStressed = spitzerPayment(
    nominalBalanceAtReset,
    rate + shockDecimal,
    remainingMonths
  );

  const postResetInterestBaseline = paymentAtResetBaseline * remainingMonths - nominalBalanceAtReset;
  const postResetInterestStressed = paymentAtResetStressed * remainingMonths - nominalBalanceAtReset;

  return {
    trackId: track.id,
    allocationAmount: amount,
    paymentToday,
    paymentStressed: Math.max(paymentToday, paymentAtResetStressed),
    totalInterestBaseline: preResetInterest + postResetInterestBaseline,
    totalInterestStressed: preResetInterest + postResetInterestStressed,
  };
}

export function computeTrackResult(
  track: Track,
  allocation: Allocation,
  loanAmount: number,
  termMonths: number,
  termYears: number,
  assumptions: Assumptions
): TrackResult {
  const amount = loanAmount * (allocation.percent / 100);
  const rate = allocation.annualRate;

  if (track.rateType === "fixed" && track.indexation === "unlinked") {
    return fixedUnlinkedResult(track, amount, rate, termMonths);
  }
  if (track.rateType === "fixed" && track.indexation === "linked") {
    return fixedLinkedResult(track, amount, rate, termMonths, termYears, assumptions.cpiAnnual);
  }
  // Variable: prime (resetIntervalYears undefined/0) or 5-year reset tracks.
  const isLinked = track.indexation === "linked";
  const resetIntervalYears = track.resetIntervalYears ?? 0;
  return variableResetResult(
    track,
    amount,
    rate,
    termMonths,
    isLinked,
    resetIntervalYears,
    assumptions.cpiAnnual,
    assumptions.stressShockPoints
  );
}
