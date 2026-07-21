/**
 * All calculation logic for the mashkanta simulator flow, kept fully
 * separate from UI components. Wraps the proven engine primitives in
 * src/engine (Spitzer amortization, CPI-linked projection, rate-shock
 * stress) and maps the three consumer-facing tracks, Prime, Kalatz
 * (fixed unindexed) and Katz (fixed CPI-linked), onto engine track ids.
 *
 * Every figure produced here is an estimate for planning purposes.
 * Purchase tax brackets are simplified approximations of the real mas
 * rechisha tables and must be confirmed by a licensed advisor. Nothing
 * in this module represents an approval, qualification, or credit
 * decision, see the readiness report framing in the summary route.
 */
import { computeTrackResult } from "../engine/calc";
import { getTrack } from "../engine/tracks";
import type { Allocation, Assumptions } from "../types";
import {
  INVESTMENT_BRACKETS,
  NEW_IMMIGRANT_BRACKETS,
  SINGLE_HOME_BRACKETS,
} from "./purchaseTaxRates";
import type { TaxBracket } from "./purchaseTaxRates";

export type Residency = "israeli" | "oleh" | "foreign";
export type BuyerStatus = "firstHome" | "replacingHome" | "investment";
export type InflationScenario = "low" | "medium" | "high";
export type TrackKey = "prime" | "kalatz" | "katz";
export type EmploymentType = "salaried" | "selfEmployed" | "mixed";
export type DownPaymentSourceType = "savings" | "homeSale" | "gift" | "other";
export type HomeSaleFundsStatus = "inHand" | "pending";
export type ExistingHomeStatusType = "sold" | "underContract" | "notListed";

export interface TrackMix {
  prime: number;
  kalatz: number;
  katz: number;
}

export interface CostInputs {
  /** User override for purchase tax in shekels; null means use the estimate */
  purchaseTaxOverride: number | null;
  legalPct: number;
  agentPct: number;
  otherFees: number;
}

/** Engine track id behind each consumer-facing track */
const ENGINE_TRACK_ID: Record<TrackKey, string> = {
  prime: "prime",
  kalatz: "fixed_unlinked",
  katz: "fixed_linked",
};

export const TRACK_INFO: Record<
  TrackKey,
  { name: string; nameHe: string; tagline: string; annualRate: number }
> = {
  prime: {
    name: "Prime",
    nameHe: "פריים",
    tagline: "Variable, tied to the Bank of Israel prime rate",
    annualRate: getTrack("prime").defaultAnnualRate,
  },
  kalatz: {
    name: "Kalatz",
    nameHe: 'קל"צ',
    tagline: "Fixed rate, not linked to inflation",
    annualRate: getTrack("fixed_unlinked").defaultAnnualRate,
  },
  katz: {
    name: "Katz",
    nameHe: 'ק"צ',
    tagline: "Fixed rate, linked to the CPI (Madad)",
    annualRate: getTrack("fixed_linked").defaultAnnualRate,
  },
};

export const INFLATION_CPI: Record<InflationScenario, number> = {
  low: 0.01,
  medium: 0.025,
  high: 0.04,
};

export const VAT_RATE = 0.18;

/**
 * Bank of Israel Directive 329 caps total mortgage payment at 50% of net
 * household income (hard ceiling); banks generally want it comfortably
 * under 40% to approve without extra friction (see spec section 2).
 */
export const DTI_HARD_CEILING = 0.5;
export const DTI_FRICTION_FLOOR = 0.4;

/** Loan-to-value ceiling for the user's situation, as a decimal. */
export function ltvCeiling(residency: Residency | null, buyerStatus: BuyerStatus | null): number {
  if (residency === "foreign") return 0.5;
  if (residency === "oleh") return 0.75;
  switch (buyerStatus) {
    case "replacingHome":
      return 0.7;
    case "investment":
      return 0.5;
    default:
      return 0.75;
  }
}

/**
 * The realistic loan to value ceiling for the scenario actually selected,
 * not just the buyer category. A buyer replacing a home whose existing
 * property has not sold yet cannot count on those proceeds, so a bank
 * treats it the same conservative way it treats an additional dwelling
 * until the sale closes, the same reasoning already applied to the
 * purchase tax bracket in estimatePurchaseTax.
 */
export function effectiveLtvCeiling(
  residency: Residency | null,
  buyerStatus: BuyerStatus | null,
  existingHomeStatus?: ExistingHomeStatusType | null
): number {
  const base = ltvCeiling(residency, buyerStatus);
  if (buyerStatus === "replacingHome" && existingHomeStatus && existingHomeStatus !== "sold") {
    return Math.min(base, 0.5);
  }
  return base;
}

export interface PlanInputs {
  loanAmount: number;
  termYears: number;
  mix: TrackMix;
  inflation: InflationScenario;
}

export interface PlanResult {
  monthlyPayment: number;
  totalInterest: number;
  totalRepayment: number;
  perTrack: Array<{
    track: TrackKey;
    percent: number;
    amount: number;
    monthlyPayment: number;
    totalInterest: number;
  }>;
}

function allocationFor(track: TrackKey, percent: number): Allocation {
  return {
    trackId: ENGINE_TRACK_ID[track],
    percent,
    annualRate: TRACK_INFO[track].annualRate,
  };
}

const TRACK_KEYS: TrackKey[] = ["prime", "kalatz", "katz"];

/** Blended plan across the mix under the chosen inflation scenario. */
export function computePlan(inputs: PlanInputs): PlanResult {
  const { loanAmount, termYears, mix, inflation } = inputs;
  const termMonths = termYears * 12;
  const assumptions: Assumptions = {
    cpiAnnual: INFLATION_CPI[inflation],
    stressShockPoints: 0,
  };

  const perTrack = TRACK_KEYS.map((track) => {
    const alloc = allocationFor(track, mix[track]);
    const result = computeTrackResult(
      getTrack(alloc.trackId),
      alloc,
      loanAmount,
      termMonths,
      termYears,
      assumptions
    );
    return {
      track,
      percent: mix[track],
      amount: result.allocationAmount,
      monthlyPayment: result.paymentToday,
      totalInterest: result.totalInterestBaseline,
    };
  });

  const monthlyPayment = perTrack.reduce((s, t) => s + t.monthlyPayment, 0);
  const totalInterest = perTrack.reduce((s, t) => s + t.totalInterest, 0);
  return {
    monthlyPayment,
    totalInterest,
    totalRepayment: loanAmount + totalInterest,
    perTrack,
  };
}

/**
 * Monthly payment if the Prime portion's rate rises by `shockPoints`
 * percentage points. Fixed tracks are untouched, that is the whole point
 * of holding them.
 */
export function stressedMonthlyPayment(inputs: PlanInputs, shockPoints: number): number {
  const { loanAmount, termYears, mix, inflation } = inputs;
  const termMonths = termYears * 12;
  const base = computePlan(inputs);
  const primeAlloc = allocationFor("prime", mix.prime);
  const shocked = computeTrackResult(
    getTrack(primeAlloc.trackId),
    primeAlloc,
    loanAmount,
    termMonths,
    termYears,
    { cpiAnnual: INFLATION_CPI[inflation], stressShockPoints: shockPoints }
  );
  const basePrime = base.perTrack.find((t) => t.track === "prime");
  return base.monthlyPayment - (basePrime?.monthlyPayment ?? 0) + shocked.paymentStressed;
}

/**
 * Estimated blended payment at a future year of the loan, holding rates
 * flat (no stress shock) but letting the CPI-linked share compound the
 * way it actually will, so the headline payment doesn't quietly assume
 * a flat line the linked portion will never hold. Kalatz and Prime are
 * held at today's payment under this baseline; only Katz grows.
 */
export function estimatedPaymentAtYear(inputs: PlanInputs, atYear: number): number {
  const plan = computePlan(inputs);
  const cpi = INFLATION_CPI[inputs.inflation];
  const horizon = Math.max(0, Math.min(atYear, inputs.termYears));
  return plan.perTrack.reduce((sum, t) => {
    if (t.track === "katz") {
      return sum + t.monthlyPayment * Math.pow(1 + cpi, horizon);
    }
    return sum + t.monthlyPayment;
  }, 0);
}

/** Bank of Israel Directive 329 caps the variable/reset-eligible share at two thirds. */
export function isWithinVariableExposureLimit(mix: TrackMix): boolean {
  return mix.prime <= 66;
}

/** Payment-to-income against the 50% hard ceiling; existing debt counts too. */
export function computeDti(monthlyPayment: number, existingMonthlyDebt: number, netIncome: number): number {
  if (netIncome <= 0) return 0;
  return (monthlyPayment + existingMonthlyDebt) / netIncome;
}

function applyBrackets(price: number, brackets: TaxBracket[]): number {
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

/**
 * Purchase tax (mas rechisha), marginal brackets from purchaseTaxRates.ts
 * (verified July 2026, frozen through 2028-01-15, see that file). An oleh
 * gets the better of the new immigrant brackets and the regular
 * single-home brackets: NEW_IMMIGRANT_BRACKETS has no 0% floor of its own,
 * so this Math.min is what actually guarantees the benefit is never worse
 * than paying as a regular resident, not the shape of the bracket table
 * itself. An earlier version leaned on a 0% floor baked into the oleh
 * table instead, which quietly broke at ordinary first time buyer prices
 * (caught by the v3 verification pass); this Math.min invariant is the
 * fix and is covered by a regression test in scripts/engine-audit.ts, so
 * it survives if the bracket numbers themselves are ever swapped again.
 * A buyer replacing a home whose existing property has not yet sold is
 * shown the temporary "additional dwelling" brackets instead, since that
 * is the bracket that actually applies until the sale completes.
 */
export function estimatePurchaseTax(
  price: number,
  residency: Residency | null,
  buyerStatus: BuyerStatus | null,
  existingHomeStatus?: ExistingHomeStatusType | null
): number {
  if (price <= 0) return 0;
  if (buyerStatus === "investment" || residency === "foreign") {
    return applyBrackets(price, INVESTMENT_BRACKETS);
  }
  if (buyerStatus === "replacingHome" && existingHomeStatus === "notListed") {
    return applyBrackets(price, INVESTMENT_BRACKETS);
  }
  const regular = applyBrackets(price, SINGLE_HOME_BRACKETS);
  if (residency === "oleh") {
    return Math.min(regular, applyBrackets(price, NEW_IMMIGRANT_BRACKETS));
  }
  return regular;
}

export interface CostBreakdown {
  purchaseTax: number;
  legalFee: number;
  agentFee: number;
  otherFees: number;
  total: number;
}

export function computeCosts(
  price: number,
  residency: Residency | null,
  buyerStatus: BuyerStatus | null,
  costs: CostInputs,
  existingHomeStatus?: ExistingHomeStatusType | null
): CostBreakdown {
  const purchaseTax =
    costs.purchaseTaxOverride ??
    estimatePurchaseTax(price, residency, buyerStatus, existingHomeStatus);
  const legalFee = price * (costs.legalPct / 100) * (1 + VAT_RATE);
  const agentFee = price * (costs.agentPct / 100) * (1 + VAT_RATE);
  return {
    purchaseTax,
    legalFee,
    agentFee,
    otherFees: costs.otherFees,
    total: purchaseTax + legalFee + agentFee + costs.otherFees,
  };
}

export function formatShekels(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatPct(fraction: number, digits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(fraction);
}
