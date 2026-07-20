/**
 * Single source of truth for the readiness report's derived figures and
 * confirms/still-needed copy. Both the on screen summary and the printed
 * PDF call buildReportModel so the two surfaces can never show different
 * numbers or claims for the same session, matching the spec's emphasis on
 * a report a banker can trust.
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
  estimatedPaymentAtYear,
  formatPct,
  isWithinVariableExposureLimit,
  stressedMonthlyPayment,
} from "./mortgageMath";
import type { PlanResult } from "./mortgageMath";

export interface ReportModel {
  loanAmount: number;
  plan: PlanResult;
  stress1: number;
  stress2: number;
  breakdown: ReturnType<typeof computeCosts>;
  ltv: number;
  cashToClose: number;
  horizonYear: number;
  paymentAtHorizon: number;
  dti: number;
  withinVariableLimit: boolean;
  showsBridgeCaution: boolean;
  verifiedDate: string | null;
  downPaymentSourceLabel: string | null;
  confirmLines: string[];
  stillNeedsLines: string[];
  cautionLines: string[];
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

  const confirmLines: string[] = [];
  if (answers.identity.verified && verifiedDate) {
    confirmLines.push(fmt(s.report.identityLine, { date: verifiedDate }));
  }
  confirmLines.push(fmt(s.report.dtiConfirmLine, { dti: formatPct(dti) }));
  if (downPaymentSourceLabel) {
    confirmLines.push(fmt(s.report.downPaymentSourceConfirmLine, { source: downPaymentSourceLabel }));
  }
  if (withinVariableLimit) confirmLines.push(s.report.variableWithinLimitLine);
  confirmLines.push(s.report.consistencyConfirmLine);

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

  const cautionLines: string[] = [];
  if (dti > DTI_HARD_CEILING) cautionLines.push(fmt(s.report.dtiWarningHard, { dti: formatPct(dti) }));
  else if (dti > DTI_FRICTION_FLOOR) {
    cautionLines.push(fmt(s.report.dtiWarningFriction, { dti: formatPct(dti) }));
  }
  if (!withinVariableLimit) cautionLines.push(s.report.variableOverLimitWarning);

  return {
    loanAmount,
    plan,
    stress1,
    stress2,
    breakdown,
    ltv,
    cashToClose,
    horizonYear,
    paymentAtHorizon,
    dti,
    withinVariableLimit,
    showsBridgeCaution,
    verifiedDate,
    downPaymentSourceLabel,
    confirmLines,
    stillNeedsLines,
    cautionLines,
  };
}
