import type { BorrowerProfile, Mix, RegulatoryCheck, RegulatoryRuleSet, Track } from "../types";
import { getTrack } from "./tracks";
import { formatPercent } from "./format";

/**
 * Every check carries the value, the limit, and a plain-language sentence
 * (section 7) — a failed check should never render as bare red UI with no
 * explanation, since inconsistent bank communication about these exact
 * limits is the whole reason this tool exists.
 */

export function effectiveTermYears(profile: BorrowerProfile, ruleSet: RegulatoryRuleSet): number {
  const ageCapTerm = ruleSet.maxAgeAtPayoff - profile.olderBorrowerAge;
  return Math.max(1, Math.min(ruleSet.maxTermYears, profile.requestedTermYears, ageCapTerm));
}

export function computeLoanAmount(profile: BorrowerProfile): number {
  return Math.max(0, profile.propertyPrice - profile.ownEquity);
}

export function computeLtv(profile: BorrowerProfile): number {
  if (profile.propertyPrice <= 0) return 0;
  return computeLoanAmount(profile) / profile.propertyPrice;
}

export function computePti(profile: BorrowerProfile, paymentToday: number): number {
  const income = profile.monthlyNetIncome;
  if (income <= 0) return 0;
  return (paymentToday + profile.existingMonthlyDebt) / income;
}

export function computeShares(
  mix: Mix,
  tracksById: (id: string) => Track
): { fixedShare: number; variableShare: number } {
  let fixed = 0;
  let variable = 0;
  for (const alloc of mix.allocations) {
    const track = tracksById(alloc.trackId);
    if (track.rateType === "fixed") fixed += alloc.percent;
    else variable += alloc.percent;
  }
  return { fixedShare: fixed / 100, variableShare: variable / 100 };
}

export function runChecks(
  profile: BorrowerProfile,
  ruleSet: RegulatoryRuleSet,
  ltv: number,
  pti: number,
  fixedShare: number,
  variableShare: number,
  termYears: number
): RegulatoryCheck[] {
  const checks: RegulatoryCheck[] = [];

  // LTV
  const ltvCap = ruleSet.ltvCaps[profile.buyerCategory];
  checks.push({
    id: "ltv",
    label: "Loan-to-Value",
    status: ltv <= ltvCap ? "pass" : "fail",
    value: ltv,
    limit: ltvCap,
    explanation:
      ltv <= ltvCap
        ? `Your loan is ${formatPercent(ltv)} of the property price, within the ${formatPercent(ltvCap)} cap for your buyer category.`
        : `Your loan is ${formatPercent(ltv)} of the property price, above the ${formatPercent(ltvCap)} cap for your buyer category. You'll need more equity or a smaller loan to bring this mix within reach.`,
  });

  // PTI
  let ptiStatus: RegulatoryCheck["status"] = "pass";
  if (pti > ruleSet.ptiHardCeiling) ptiStatus = "fail";
  else if (pti > ruleSet.ptiCautionFloor) ptiStatus = "warn";
  checks.push({
    id: "pti",
    label: "Payment-to-Income",
    status: ptiStatus,
    value: pti,
    limit: ruleSet.ptiHardCeiling,
    explanation:
      ptiStatus === "fail"
        ? `Your payment (plus existing debt) is ${formatPercent(pti)} of net income, above the ${formatPercent(ruleSet.ptiHardCeiling)} legal ceiling — this loan is not approvable as structured.`
        : ptiStatus === "warn"
          ? `Your payment (plus existing debt) is ${formatPercent(pti)} of net income. That's legal but above the roughly ${formatPercent(ruleSet.ptiCautionFloor)} mark banks self-limit around in practice — expect closer scrutiny or a less favorable rate offer.`
          : `Your payment (plus existing debt) is ${formatPercent(pti)} of net income, comfortably under the ${formatPercent(ruleSet.ptiCautionFloor)} level banks typically look for.`,
  });

  // Fixed share
  checks.push({
    id: "fixed_share",
    label: "Minimum Fixed Share",
    status: fixedShare >= ruleSet.minFixedShare ? "pass" : "fail",
    value: fixedShare,
    limit: ruleSet.minFixedShare,
    explanation:
      fixedShare >= ruleSet.minFixedShare
        ? `${formatPercent(fixedShare)} of your mix is fixed-rate, meeting the ${formatPercent(ruleSet.minFixedShare)} minimum required by regulation.`
        : `Only ${formatPercent(fixedShare)} of your mix is fixed-rate. At least ${formatPercent(ruleSet.minFixedShare)} must be fixed — move more of the loan into a fixed track to fix this.`,
  });

  // Variable share
  checks.push({
    id: "variable_share",
    label: "Maximum Variable Share",
    status: variableShare <= ruleSet.maxVariableShare ? "pass" : "fail",
    value: variableShare,
    limit: ruleSet.maxVariableShare,
    explanation:
      variableShare <= ruleSet.maxVariableShare
        ? `${formatPercent(variableShare)} of your mix is variable/reset-eligible, within the ${formatPercent(ruleSet.maxVariableShare)} cap.`
        : `${formatPercent(variableShare)} of your mix is variable/reset-eligible, above the ${formatPercent(ruleSet.maxVariableShare)} cap — move some of the loan into a fixed track to fix this.`,
  });

  // Term / age
  const requestedExceedsCap = profile.requestedTermYears > termYears;
  checks.push({
    id: "term",
    label: "Term & Age Cap",
    status: requestedExceedsCap ? "warn" : "pass",
    value: profile.requestedTermYears,
    limit: termYears,
    explanation: requestedExceedsCap
      ? `You requested a ${profile.requestedTermYears}-year term, but the effective cap for you is ${termYears} years — the smaller of the ${ruleSet.maxTermYears}-year regulatory maximum and paying off by age ${ruleSet.maxAgeAtPayoff}. Figures on this page use the ${termYears}-year effective term.`
      : `Your ${termYears}-year term is within both the ${ruleSet.maxTermYears}-year regulatory maximum and the age-${ruleSet.maxAgeAtPayoff} payoff cap.`,
  });

  return checks;
}

export { getTrack };
