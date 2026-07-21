/**
 * Single source of truth for the investor-mode section of the readiness
 * report, same discipline as reportModel.ts: both the on screen summary
 * and the printed PDF call buildInvestorReportModel so they can never
 * show different investor numbers for the same session.
 */
import {
  computeBreakEvenRent,
  computeCashOnCashReturn,
  computeDscr,
  computeRateSensitivity,
  computeRentalCashFlow,
} from "./investorMath";
import type { RateSensitivityPoint } from "./investorMath";
import type { PlanInputs } from "./mortgageMath";
import type { SimulatorAnswers } from "../state/simulatorStore";

export interface InvestorReportModel {
  monthlyRent: number;
  effectiveMonthlyRent: number;
  vacancyLossMonthly: number;
  buildingInsuranceMonthly: number;
  managementFeeMonthly: number;
  maintenanceMonthly: number;
  recurringMonthlyCosts: number;
  netMonthlyCashFlow: number;
  grossAnnualYieldPct: number;
  netAnnualYieldPct: number;
  cashOnCashReturnPct: number;
  breakEvenRent: number;
  dscr: number;
  totalCashNeeded: number;
  rateSensitivity: RateSensitivityPoint[];
}

/**
 * Returns null when the session isn't in investor mode (buyerStatus !==
 * "investment"), so callers can render the whole section conditionally
 * with a single check.
 */
export function buildInvestorReportModel(
  answers: SimulatorAnswers,
  planInputs: PlanInputs,
  monthlyMortgagePayment: number,
  cashToClose: number
): InvestorReportModel | null {
  if (answers.buyerStatus !== "investment") return null;

  const { investor } = answers;
  const cashFlow = computeRentalCashFlow(
    investor.monthlyRent,
    monthlyMortgagePayment,
    answers.propertyPrice,
    investor
  );
  const cashOnCashReturnPct = computeCashOnCashReturn(cashFlow.netMonthlyCashFlow, cashToClose);
  const breakEvenRent = computeBreakEvenRent(monthlyMortgagePayment, cashFlow.recurringMonthlyCosts);
  const dscr = computeDscr(investor.monthlyRent, monthlyMortgagePayment);
  const rateSensitivity = computeRateSensitivity(
    planInputs,
    cashFlow.effectiveMonthlyRent,
    cashFlow.recurringMonthlyCosts
  );

  return {
    monthlyRent: investor.monthlyRent,
    ...cashFlow,
    cashOnCashReturnPct,
    breakEvenRent,
    dscr,
    totalCashNeeded: cashToClose,
    rateSensitivity,
  };
}
