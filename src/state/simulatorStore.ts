/**
 * Single shared answer store for the simulator flow. Lives above the
 * router, so navigating between question routes never wipes answers.
 * Session-only by design, no persistence, no backend, no data capture.
 */
import { create } from "zustand";
import type {
  BuyerStatus,
  CostInputs,
  InflationScenario,
  Residency,
  TrackMix,
} from "../lib/mortgageMath";

export interface SimulatorAnswers {
  residency: Residency | null;
  /** Years since aliyah, only meaningful when residency is "oleh" */
  aliyahYears: number;
  /** Owned property in Israel in the past, only asked for olim */
  ownedPropertyBefore: boolean | null;
  buyerStatus: BuyerStatus | null;
  propertyPrice: number;
  downPayment: number;
  termYears: number;
  mix: TrackMix;
  inflation: InflationScenario;
  costs: CostInputs;
}

interface SimulatorStore extends SimulatorAnswers {
  setResidency: (value: Residency) => void;
  setAliyahYears: (value: number) => void;
  setOwnedPropertyBefore: (value: boolean) => void;
  setBuyerStatus: (value: BuyerStatus) => void;
  setPropertyPrice: (value: number) => void;
  setDownPayment: (value: number) => void;
  setTermYears: (value: number) => void;
  setMix: (value: TrackMix) => void;
  setInflation: (value: InflationScenario) => void;
  setCosts: (value: Partial<CostInputs>) => void;
  reset: () => void;
}

const initialAnswers: SimulatorAnswers = {
  residency: null,
  aliyahYears: 3,
  ownedPropertyBefore: null,
  buyerStatus: null,
  propertyPrice: 2_000_000,
  downPayment: 600_000,
  termYears: 25,
  mix: { prime: 33, kalatz: 34, katz: 33 },
  inflation: "medium",
  costs: { purchaseTaxOverride: null, legalPct: 1.5, agentPct: 2, otherFees: 7_500 },
};

export const useSimulatorStore = create<SimulatorStore>((set) => ({
  ...initialAnswers,
  setResidency: (residency) => set({ residency }),
  setAliyahYears: (aliyahYears) => set({ aliyahYears }),
  setOwnedPropertyBefore: (ownedPropertyBefore) => set({ ownedPropertyBefore }),
  setBuyerStatus: (buyerStatus) => set({ buyerStatus }),
  setPropertyPrice: (propertyPrice) =>
    set((state) => ({
      propertyPrice,
      // Keep the down payment meaningful if the price drops below it.
      downPayment: Math.min(state.downPayment, propertyPrice),
    })),
  setDownPayment: (downPayment) => set({ downPayment }),
  setTermYears: (termYears) => set({ termYears }),
  setMix: (mix) => set({ mix }),
  setInflation: (inflation) => set({ inflation }),
  setCosts: (costs) => set((state) => ({ costs: { ...state.costs, ...costs } })),
  reset: () => set({ ...initialAnswers }),
}));

/** Derived loan amount, the number every later step revolves around. */
export function loanAmountOf(state: Pick<SimulatorAnswers, "propertyPrice" | "downPayment">): number {
  return Math.max(0, state.propertyPrice - state.downPayment);
}
