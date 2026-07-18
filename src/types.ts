// Core domain types for the Mashkanta Mix Simulator.
// Kept as plain data (no classes) so the rule set and track defaults can be
// swapped as versioned config without touching calculation logic.

export type RateType = "fixed" | "variable";
export type IndexationType = "linked" | "unlinked"; // CPI-linked or not

export type BuyerCategory =
  | "first_home"
  | "replacement_home"
  | "investment"
  | "foreign_resident"
  | "oleh_chadash";

export interface Track {
  id: string;
  /** English display name */
  name: string;
  /** Hebrew term shown alongside the English name in the UI */
  nameHe: string;
  rateType: RateType;
  indexation: IndexationType;
  /** Years between rate resets; undefined = never resets (fixed), 0 = floats continuously (prime) */
  resetIntervalYears?: number;
  /** Default annual interest rate, as a decimal (0.045 = 4.5%) */
  defaultAnnualRate: number;
  /** Whether this track type typically carries a prepayment penalty when market rates fall below its rate */
  penaltyOnPrepay: boolean;
}

export interface Allocation {
  trackId: string;
  /** Percent of total loan amount, 0-100 */
  percent: number;
  /** Annual interest rate for this allocation, as a decimal. Defaults to the track's defaultAnnualRate but user-editable. */
  annualRate: number;
}

export interface Mix {
  id: string;
  name: string;
  allocations: Allocation[];
}

export interface BorrowerProfile {
  propertyPrice: number;
  ownEquity: number;
  buyerCategory: BuyerCategory;
  monthlyNetIncome: number;
  olderBorrowerAge: number;
  existingMonthlyDebt: number;
  requestedTermYears: number;
}

export interface Assumptions {
  /** Assumed annual CPI rate, as a decimal (0.03 = 3%) */
  cpiAnnual: number;
  /** Stress-test rate shock applied to variable/reset tracks, in percentage points (1.5 = +1.5pp) */
  stressShockPoints: number;
}

/** LTV cap per buyer category, as a decimal fraction of property price */
export type LtvCapTable = Record<BuyerCategory, number>;

export interface RegulatoryRuleSet {
  /** ISO date this rule set became effective — shown in the UI as a freshness signal */
  effectiveDate: string;
  /** Source/citation note, e.g. "Bank of Israel Directive 329" */
  source: string;
  ltvCaps: LtvCapTable;
  /** Hard ceiling on payment-to-income ratio (decimal) */
  ptiHardCeiling: number;
  /** Caution zone lower bound — banks self-limit around here even though the legal ceiling is higher */
  ptiCautionFloor: number;
  /** Minimum share of the loan that must sit in fixed-rate tracks (decimal) */
  minFixedShare: number;
  /** Maximum share of the loan that may sit in variable/reset-eligible tracks (decimal) */
  maxVariableShare: number;
  /** Maximum loan term in years */
  maxTermYears: number;
  /** Maximum age of the older borrower at loan payoff */
  maxAgeAtPayoff: number;
}

export type CheckStatus = "pass" | "warn" | "fail";

export interface RegulatoryCheck {
  id: string;
  label: string;
  status: CheckStatus;
  /** The borrower's actual computed value */
  value: number;
  /** The limit being checked against */
  limit: number;
  /** Plain-language explanation of what this means in practice, always shown, never bare color */
  explanation: string;
}

export interface TrackResult {
  trackId: string;
  allocationAmount: number;
  /** Monthly payment on this track today, under the baseline scenario */
  paymentToday: number;
  /** Highest expected monthly payment on this track under the stress scenario */
  paymentStressed: number;
  /** Total interest paid over the life of this track, baseline scenario */
  totalInterestBaseline: number;
  /** Total interest paid over the life of this track, stress scenario */
  totalInterestStressed: number;
}

export interface MixResult {
  loanAmount: number;
  trackResults: TrackResult[];
  paymentToday: number;
  paymentStressed: number;
  totalInterestBaseline: number;
  totalInterestStressed: number;
  fixedShare: number;
  variableShare: number;
  ltv: number;
  pti: number;
  checks: RegulatoryCheck[];
  /** Effective term cap after applying both the 30-year cap and the age-at-payoff cap */
  effectiveTermYears: number;
}

export interface Basket {
  id: string;
  name: string;
  description: string;
  allocations: Array<{ trackId: string; percent: number }>;
}
