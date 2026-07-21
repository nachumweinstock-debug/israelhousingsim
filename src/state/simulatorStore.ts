/**
 * Single shared answer store for the simulator flow. Lives above the
 * router, so navigating between question routes never wipes answers.
 * Session-only by design, no persistence beyond the anonymous capture
 * fired once from the summary screen.
 */
import { create } from "zustand";
import type {
  BuyerStatus,
  CostInputs,
  DownPaymentSourceType,
  EmploymentType,
  ExistingHomeStatusType,
  HomeSaleFundsStatus,
  InflationScenario,
  Residency,
  TrackMix,
} from "../lib/mortgageMath";
import type { InvestorRecurringCostInputs } from "../lib/investorMath";

export interface IncomeAnswers {
  applicantIncome: number;
  hasCoApplicant: boolean;
  coApplicantIncome: number;
  employmentType: EmploymentType;
  employerTenureYears: number;
  existingMonthlyDebt: number;
}

export interface DownPaymentSourceAnswers {
  source: DownPaymentSourceType | null;
  /** Only meaningful when source is "homeSale" */
  homeSaleStatus: HomeSaleFundsStatus | null;
}

export interface CreditStandingAnswers {
  missedPayments: boolean | null;
  collections: boolean | null;
  bankruptcy: boolean | null;
}

/** Only collected and only shown when buyerStatus === "investment". */
export interface InvestorAnswers extends InvestorRecurringCostInputs {
  monthlyRent: number;
}

export interface SimulatorAnswers {
  residency: Residency | null;
  aliyahYears: number;
  ownedPropertyBefore: boolean | null;
  buyerStatus: BuyerStatus | null;
  existingHomeStatus: ExistingHomeStatusType | null;
  income: IncomeAnswers;
  propertyPrice: number;
  downPayment: number;
  downPaymentSource: DownPaymentSourceAnswers;
  termYears: number;
  mix: TrackMix;
  inflation: InflationScenario;
  costs: CostInputs;
  creditStanding: CreditStandingAnswers;
  investor: InvestorAnswers;
}

interface SimulatorStore extends SimulatorAnswers {
  setResidency: (value: Residency) => void;
  setAliyahYears: (value: number) => void;
  setOwnedPropertyBefore: (value: boolean) => void;
  setBuyerStatus: (value: BuyerStatus) => void;
  setExistingHomeStatus: (value: ExistingHomeStatusType) => void;
  setIncome: (value: Partial<IncomeAnswers>) => void;
  setPropertyPrice: (value: number) => void;
  setDownPayment: (value: number) => void;
  setDownPaymentSource: (value: Partial<DownPaymentSourceAnswers>) => void;
  setTermYears: (value: number) => void;
  setMix: (value: TrackMix) => void;
  setInflation: (value: InflationScenario) => void;
  setCosts: (value: Partial<CostInputs>) => void;
  setCreditStanding: (value: Partial<CreditStandingAnswers>) => void;
  setInvestor: (value: Partial<InvestorAnswers>) => void;
  reset: () => void;
}

const initialAnswers: SimulatorAnswers = {
  residency: null,
  aliyahYears: 3,
  ownedPropertyBefore: null,
  buyerStatus: null,
  existingHomeStatus: null,
  income: {
    applicantIncome: 22_000,
    hasCoApplicant: false,
    coApplicantIncome: 0,
    employmentType: "salaried",
    employerTenureYears: 3,
    existingMonthlyDebt: 2_000,
  },
  propertyPrice: 2_000_000,
  downPayment: 600_000,
  downPaymentSource: { source: null, homeSaleStatus: null },
  termYears: 25,
  mix: { prime: 33, kalatz: 34, katz: 33 },
  inflation: "medium",
  costs: { purchaseTaxOverride: null, legalPct: 1.5, agentPct: 2, otherFees: 7_500 },
  creditStanding: { missedPayments: null, collections: null, bankruptcy: null },
  investor: {
    monthlyRent: 6_000,
    buildingInsuranceAnnual: 1_500,
    useManagementCompany: false,
    managementFeePct: 8,
    maintenancePct: 5,
    vacancyMonths: 0,
  },
};

export const useSimulatorStore = create<SimulatorStore>((set) => ({
  ...initialAnswers,
  setResidency: (residency) => set({ residency }),
  setAliyahYears: (aliyahYears) => set({ aliyahYears }),
  setOwnedPropertyBefore: (ownedPropertyBefore) => set({ ownedPropertyBefore }),
  setBuyerStatus: (buyerStatus) => set({ buyerStatus }),
  setExistingHomeStatus: (existingHomeStatus) => set({ existingHomeStatus }),
  setIncome: (income) => set((state) => ({ income: { ...state.income, ...income } })),
  setPropertyPrice: (propertyPrice) =>
    set((state) => ({
      propertyPrice,
      // Keep the down payment meaningful if the price drops below it.
      downPayment: Math.min(state.downPayment, propertyPrice),
    })),
  setDownPayment: (downPayment) => set({ downPayment }),
  setDownPaymentSource: (downPaymentSource) =>
    set((state) => ({ downPaymentSource: { ...state.downPaymentSource, ...downPaymentSource } })),
  setTermYears: (termYears) => set({ termYears }),
  setMix: (mix) => set({ mix }),
  setInflation: (inflation) => set({ inflation }),
  setCosts: (costs) => set((state) => ({ costs: { ...state.costs, ...costs } })),
  setCreditStanding: (creditStanding) =>
    set((state) => ({ creditStanding: { ...state.creditStanding, ...creditStanding } })),
  setInvestor: (investor) => set((state) => ({ investor: { ...state.investor, ...investor } })),
  reset: () => set({ ...initialAnswers }),
}));

/** Derived loan amount, the number every later step revolves around. */
export function loanAmountOf(state: Pick<SimulatorAnswers, "propertyPrice" | "downPayment">): number {
  return Math.max(0, state.propertyPrice - state.downPayment);
}

/** Total net household income the DTI check is measured against. */
export function totalIncomeOf(income: IncomeAnswers): number {
  return income.applicantIncome + (income.hasCoApplicant ? income.coApplicantIncome : 0);
}
