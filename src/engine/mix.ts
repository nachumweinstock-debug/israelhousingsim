import type { Assumptions, BorrowerProfile, Mix, MixResult, RegulatoryRuleSet } from "../types";
import { computeTrackResult } from "./calc";
import { getTrack } from "./tracks";
import {
  computeLoanAmount,
  computeLtv,
  computePti,
  computeShares,
  effectiveTermYears,
  runChecks,
} from "./validation";

/** Computes a full MixResult for any mix — the user's custom mix or one of
 * the three official baskets. Both run through this exact same function
 * (section 4), so they're guaranteed consistent with each other. */
export function computeMixResult(
  mix: Mix,
  profile: BorrowerProfile,
  assumptions: Assumptions,
  ruleSet: RegulatoryRuleSet
): MixResult {
  const loanAmount = computeLoanAmount(profile);
  const termYears = effectiveTermYears(profile, ruleSet);
  const termMonths = termYears * 12;

  const trackResults = mix.allocations.map((alloc) =>
    computeTrackResult(getTrack(alloc.trackId), alloc, loanAmount, termMonths, termYears, assumptions)
  );

  const paymentToday = trackResults.reduce((s, r) => s + r.paymentToday, 0);
  const paymentStressed = trackResults.reduce((s, r) => s + r.paymentStressed, 0);
  const totalInterestBaseline = trackResults.reduce((s, r) => s + r.totalInterestBaseline, 0);
  const totalInterestStressed = trackResults.reduce((s, r) => s + r.totalInterestStressed, 0);

  const { fixedShare, variableShare } = computeShares(mix, getTrack);
  const ltv = computeLtv(profile);
  const pti = computePti(profile, paymentToday);

  const checks = runChecks(profile, ruleSet, ltv, pti, fixedShare, variableShare, termYears);

  return {
    loanAmount,
    trackResults,
    paymentToday,
    paymentStressed,
    totalInterestBaseline,
    totalInterestStressed,
    fixedShare,
    variableShare,
    ltv,
    pti,
    checks,
    effectiveTermYears: termYears,
  };
}

/** Sum of allocation percentages — used for the live "must sum to 100" warning (section 4). */
export function allocationTotal(mix: Mix): number {
  return mix.allocations.reduce((s, a) => s + a.percent, 0);
}
