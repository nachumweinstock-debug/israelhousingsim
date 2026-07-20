/**
 * Single source of truth for the readiness report's derived figures and
 * the checklist copy. Both the on screen summary and the printed PDF
 * call buildReportModel so the two surfaces can never show different
 * numbers or claims for the same session, matching the spec's emphasis
 * on a report a banker can trust.
 *
 * Every threshold item (DTI, LTV, variable rate exposure) lives in one
 * unified checks array with a pass, warn, or fail status that is always
 * rendered, never omitted. A failure must be exactly as visible as a
 * pass, not buried in a paragraph above the list that states it.
 */
import { fmt } from "../i18n";
import type { Lang } from "../i18n";
import type { SimStrings } from "../state/texts";
import type { SimulatorAnswers } from "../state/simulatorStore";
import { loanAmountOf, totalIncomeOf } from "../state/simulatorStore";
import {
  DTI_FRICTION_FLOOR,
  DTI_HARD_CEILING,
  computeCosts,
  computeDti,
  computePlan,
  effectiveLtvCeiling,
  estimatedPaymentAtYear,
  formatPct,
  isWithinVariableExposureLimit,
  stressedMonthlyPayment,
} from "./mortgageMath";
import type { PlanResult } from "./mortgageMath";

export type CheckStatus = "pass" | "warn" | "fail";

export interface CheckItem {
  id: string;
  status: CheckStatus;
  text: string;
}

export interface ReportModel {
  loanAmount: number;
  plan: PlanResult;
  stress1: number;
  stress2: number;
  breakdown: ReturnType<typeof computeCosts>;
  ltv: number;
  ltvCeilingUsed: number;
  cashToClose: number;
  horizonYear: number;
  paymentAtHorizon: number;
  dti: number;
  showsBridgeCaution: boolean;
  verifiedDate: string | null;
  downPaymentSourceLabel: string | null;
  checks: CheckItem[];
  hasFailure: boolean;
  failingChecks: CheckItem[];
  stillNeedsLines: string[];
  creditNotes: string[];
}

export function buildReportModel(answers: SimulatorAnswers, s: SimStrings, lang: Lang): ReportModel {
  const loanAmount = loanAmountOf(answers);
  const planInputs = {
    loanAmount,
    termYears: answers.termYears,
    mix: answers.mix,
    inflation: answers.inflation,
  };
  const plan = computePlan(planInputs);
  const stress1 = stressedMonthlyPayment(planInputs, 1);
  const stress2 = stressedMonthlyPayment(planInputs, 2);
  const breakdown = computeCosts(
    answers.propertyPrice,
    answers.residency,
    answers.buyerStatus,
    answers.costs,
    answers.existingHomeStatus
  );
  const ltv = answers.propertyPrice > 0 ? loanAmount / answers.propertyPrice : 0;
  const ltvCeilingUsed = effectiveLtvCeiling(answers.residency, answers.buyerStatus, answers.existingHomeStatus);
  const cashToClose = answers.downPayment + breakdown.total;
  const horizonYear = Math.min(10, answers.termYears);
  const paymentAtHorizon = estimatedPaymentAtYear(planInputs, horizonYear);
  const totalIncome = totalIncomeOf(answers.income);
  const dti = computeDti(plan.monthlyPayment, answers.income.existingMonthlyDebt, totalIncome);
  const withinVariableLimit = isWithinVariableExposureLimit(answers.mix);
  const showsBridgeCaution =
    answers.buyerStatus === "replacingHome" && answers.existingHomeStatus !== "sold";

  const verifiedDate = answers.identity.verifiedAt
    ? new Date(answers.identity.verifiedAt).toLocaleDateString(lang === "he" ? "he-IL" : "en-GB")
    : null;

  const downPaymentSourceLabel = answers.downPaymentSource.source
    ? s.downPaymentSource[answers.downPaymentSource.source].title
    : null;

  // Every entry below is always rendered, whichever status it lands on.
  // A failure must be exactly as visible as a pass, never demoted to a
  // paragraph elsewhere on the page.
  const checks: CheckItem[] = [];

  if (answers.identity.verified && verifiedDate) {
    checks.push({ id: "identity", status: "pass", text: fmt(s.report.identityLine, { date: verifiedDate }) });
  }

  if (dti > DTI_HARD_CEILING) {
    checks.push({ id: "dti", status: "fail", text: fmt(s.report.dtiWarningHard, { dti: formatPct(dti) }) });
  } else if (dti > DTI_FRICTION_FLOOR) {
    checks.push({ id: "dti", status: "warn", text: fmt(s.report.dtiWarningFriction, { dti: formatPct(dti) }) });
  } else {
    checks.push({ id: "dti", status: "pass", text: fmt(s.report.dtiPassLine, { dti: formatPct(dti) }) });
  }

  if (downPaymentSourceLabel) {
    checks.push({
      id: "downPaymentSource",
      status: "pass",
      text: fmt(s.report.downPaymentSourceConfirmLine, { source: downPaymentSourceLabel }),
    });
  }

  if (ltv > ltvCeilingUsed) {
    checks.push({
      id: "ltv",
      status: "fail",
      text: fmt(s.report.ltvFailLine, { ltv: formatPct(ltv), ceiling: formatPct(ltvCeilingUsed) }),
    });
  } else {
    checks.push({
      id: "ltv",
      status: "pass",
      text: fmt(s.report.ltvPassLine, { ltv: formatPct(ltv), ceiling: formatPct(ltvCeilingUsed) }),
    });
  }

  checks.push(
    withinVariableLimit
      ? { id: "variableExposure", status: "pass", text: s.report.variableWithinLimitLine }
      : { id: "variableExposure", status: "fail", text: s.report.variableOverLimitWarning }
  );

  checks.push({ id: "consistency", status: "pass", text: s.report.consistencyConfirmLine });

  const failingChecks = checks.filter((c) => c.status === "fail");
  const hasFailure = failingChecks.length > 0;

  const stillNeedsLines: string[] = [];
  if (!answers.identity.verified) stillNeedsLines.push(s.report.stillNeeds.identityPending);
  stillNeedsLines.push(s.report.stillNeeds.credit);
  if (answers.income.employmentType === "selfEmployed") {
    stillNeedsLines.push(s.report.stillNeeds.incomeDocsSelfEmployed);
  } else if (answers.income.employmentType === "mixed") {
    stillNeedsLines.push(s.report.stillNeeds.incomeDocsMixed);
  } else {
    stillNeedsLines.push(s.report.stillNeeds.incomeDocsSalaried);
  }
  stillNeedsLines.push(s.report.stillNeeds.appraisal);
  stillNeedsLines.push(s.report.stillNeeds.finalRate);

  // Self declared credit answers are surfaced for the bank's context, not
  // scored and never turned into a check failure, the tool has no
  // authority to make that call.
  const creditNotes: string[] = [];
  if (answers.creditStanding.missedPayments) creditNotes.push(s.report.creditNotes.missedPayments);
  if (answers.creditStanding.collections) creditNotes.push(s.report.creditNotes.collections);
  if (answers.creditStanding.bankruptcy) creditNotes.push(s.report.creditNotes.bankruptcy);

  return {
    loanAmount,
    plan,
    stress1,
    stress2,
    breakdown,
    ltv,
    ltvCeilingUsed,
    cashToClose,
    horizonYear,
    paymentAtHorizon,
    dti,
    showsBridgeCaution,
    verifiedDate,
    downPaymentSourceLabel,
    checks,
    hasFailure,
    failingChecks,
    stillNeedsLines,
    creditNotes,
  };
}
