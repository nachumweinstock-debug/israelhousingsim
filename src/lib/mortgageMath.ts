/**
 * All calculation logic for the mashkanta simulator flow, kept fully
 * separate from UI components. Wraps the proven engine primitives in
 * src/engine (Spitzer amortization, CPI-linked projection, rate-shock
 * stress) and maps the three consumer-facing tracks, Prime, Kalatz
 * (fixed unindexed) and Katz (fixed CPI-linked), onto engine track ids.
 *
 * Every figure produced here is an estimate for planning purposes.
 * Purchase tax brackets are simplified approximations of the real mas
 * rechisha tables and must be confirmed by a licensed advisor.
 */
import { computeTrackResult } from "../engine/calc";
import { getTrack } from "../engine/tracks";
import type { Allocation, Assumptions } from "../types";

export type Residency = "israeli" | "oleh" | "foreign";
export type BuyerStatus = "firstHome" | "replacingHome" | "investment";
export type InflationScenario = "low" | "medium" | "high";
export type TrackKey = "prime" | "kalatz" | "katz";

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

interface TaxBracket {
  upTo: number;
  rate: number;
}

/** Simplified single-home mas rechisha brackets (approximate 2025 figures). */
const SINGLE_HOME_BRACKETS: TaxBracket[] = [
  { upTo: 1_978_745, rate: 0 },
  { upTo: 2_347_040, rate: 0.035 },
  { upTo: 6_055_070, rate: 0.05 },
  { upTo: Infinity, rate: 0.08 },
];

/** Additional property / foreign resident brackets (approximate). */
const INVESTMENT_BRACKETS: TaxBracket[] = [
  { upTo: 6_055_070, rate: 0.08 },
  { upTo: Infinity, rate: 0.1 },
];

/** Oleh chadash benefit brackets (approximate). */
const OLEH_BRACKETS: TaxBracket[] = [
  { upTo: 1_988_090, rate: 0.005 },
  { upTo: Infinity, rate: 0.05 },
];

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
 * Approximate purchase tax (mas rechisha). An oleh gets the better of the
 * aliyah benefit brackets and the regular single-home brackets.
 */
export function estimatePurchaseTax(
  price: number,
  residency: Residency | null,
  buyerStatus: BuyerStatus | null
): number {
  if (price <= 0) return 0;
  if (buyerStatus === "investment" || residency === "foreign") {
    return applyBrackets(price, INVESTMENT_BRACKETS);
  }
  const regular = applyBrackets(price, SINGLE_HOME_BRACKETS);
  if (residency === "oleh") {
    return Math.min(regular, applyBrackets(price, OLEH_BRACKETS));
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
  costs: CostInputs
): CostBreakdown {
  const purchaseTax =
    costs.purchaseTaxOverride ?? estimatePurchaseTax(price, residency, buyerStatus);
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
