/**
 * Investor-mode calculations: rental cash flow, yields, and the financing
 * metrics an investor cares about beyond a plain amortization schedule.
 * Deliberately reuses the existing engine (computePlan, stressedMonthlyPayment)
 * rather than modeling rate risk a second, different way, this all shares
 * the same "shock the Prime track only" convention already established for
 * the stress1/stress2 numbers on the summary screen.
 *
 * mas shevach (betterment tax owed on an eventual sale) is out of scope
 * here, see the note in purchaseTaxRates.ts, this module only covers
 * holding-period cash flow and financing metrics, not a future sale.
 */
import { computePlan, stressedMonthlyPayment } from "./mortgageMath";
import type { PlanInputs } from "./mortgageMath";

export interface InvestorRecurringCostInputs {
  /** User-entered estimate, real premiums vary by property value, age, and location. */
  buildingInsuranceAnnual: number;
  /** Only applied when true, percentage of monthly rent. */
  useManagementCompany: boolean;
  managementFeePct: number;
  /** Editable estimate, commonly modeled as a percentage of annual rent. */
  maintenancePct: number;
  /** Vacant months per year, 0 means fully occupied (the default assumption). */
  vacancyMonths: number;
}

export interface RentalCashFlowResult {
  vacancyLossMonthly: number;
  effectiveMonthlyRent: number;
  buildingInsuranceMonthly: number;
  managementFeeMonthly: number;
  maintenanceMonthly: number;
  /** Insurance + management + maintenance, excludes the mortgage payment and vacancy. */
  recurringMonthlyCosts: number;
  /** effectiveMonthlyRent - monthlyMortgagePayment - recurringMonthlyCosts. */
  netMonthlyCashFlow: number;
  /** Full potential annual rent (no vacancy) over property price. */
  grossAnnualYieldPct: number;
  /** (Effective annual rent - annual recurring costs) over property price. */
  netAnnualYieldPct: number;
}

/** Rental cash flow, yields, and their recurring-cost components in one call. */
export function computeRentalCashFlow(
  monthlyRent: number,
  monthlyMortgagePayment: number,
  propertyPrice: number,
  costs: InvestorRecurringCostInputs
): RentalCashFlowResult {
  const vacancyMonths = Math.min(12, Math.max(0, costs.vacancyMonths));
  const vacancyLossMonthly = (monthlyRent * vacancyMonths) / 12;
  const effectiveMonthlyRent = monthlyRent - vacancyLossMonthly;

  const buildingInsuranceMonthly = costs.buildingInsuranceAnnual / 12;
  const managementFeeMonthly = costs.useManagementCompany
    ? monthlyRent * (costs.managementFeePct / 100)
    : 0;
  const maintenanceMonthly = monthlyRent * (costs.maintenancePct / 100);
  const recurringMonthlyCosts = buildingInsuranceMonthly + managementFeeMonthly + maintenanceMonthly;

  const netMonthlyCashFlow = effectiveMonthlyRent - monthlyMortgagePayment - recurringMonthlyCosts;

  const grossAnnualYieldPct = propertyPrice > 0 ? (monthlyRent * 12) / propertyPrice : 0;
  const netAnnualYieldPct =
    propertyPrice > 0
      ? (effectiveMonthlyRent * 12 - recurringMonthlyCosts * 12) / propertyPrice
      : 0;

  return {
    vacancyLossMonthly,
    effectiveMonthlyRent,
    buildingInsuranceMonthly,
    managementFeeMonthly,
    maintenanceMonthly,
    recurringMonthlyCosts,
    netMonthlyCashFlow,
    grossAnnualYieldPct,
    netAnnualYieldPct,
  };
}

/**
 * Cash on cash return: annual net cash flow over total cash actually put
 * in (down payment + purchase tax + closing costs). Usually more
 * meaningful to a leveraged investor than raw yield, which ignores how
 * much of the price is borrowed.
 */
export function computeCashOnCashReturn(netMonthlyCashFlow: number, totalCashInvested: number): number {
  if (totalCashInvested <= 0) return 0;
  return (netMonthlyCashFlow * 12) / totalCashInvested;
}

/** Minimum monthly rent needed to cover the mortgage payment plus all recurring costs. */
export function computeBreakEvenRent(monthlyMortgagePayment: number, recurringMonthlyCosts: number): number {
  return monthlyMortgagePayment + recurringMonthlyCosts;
}

/**
 * Debt service coverage ratio: monthly rent over monthly mortgage payment.
 * Israeli banks often reference something like this when underwriting an
 * investment property loan, alongside a lower LTV ceiling than a primary
 * residence gets, see effectiveLtvCeiling in mortgageMath.ts. This is a
 * simplified indicator, not a bank's actual underwriting formula, which
 * varies by lender.
 */
export function computeDscr(monthlyRent: number, monthlyMortgagePayment: number): number {
  if (monthlyMortgagePayment <= 0) return 0;
  return monthlyRent / monthlyMortgagePayment;
}

export interface RateSensitivityPoint {
  /** -1, 0, or +1 percentage point relative to the entered rate. */
  shockPoints: number;
  monthlyPayment: number;
  netMonthlyCashFlow: number;
}

/**
 * Monthly payment and resulting cash flow at the entered rate, one point
 * higher, and one point lower. Only the Prime portion of the mix moves,
 * matching the existing stress1/stress2 convention on the summary screen,
 * fixed tracks don't reprice.
 */
export function computeRateSensitivity(
  planInputs: PlanInputs,
  effectiveMonthlyRent: number,
  recurringMonthlyCosts: number
): RateSensitivityPoint[] {
  const basePayment = computePlan(planInputs).monthlyPayment;
  return [-1, 0, 1].map((shockPoints) => {
    const monthlyPayment = shockPoints === 0 ? basePayment : stressedMonthlyPayment(planInputs, shockPoints);
    return {
      shockPoints,
      monthlyPayment,
      netMonthlyCashFlow: effectiveMonthlyRent - monthlyPayment - recurringMonthlyCosts,
    };
  });
}
