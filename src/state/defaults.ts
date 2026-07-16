import type { Assumptions, BorrowerProfile, Mix } from "../types";
import { DEFAULT_TRACKS } from "../engine/tracks";

export const DEFAULT_PROFILE: BorrowerProfile = {
  propertyPrice: 2_000_000,
  ownEquity: 500_000,
  buyerCategory: "first_home",
  monthlyNetIncome: 20_000,
  olderBorrowerAge: 35,
  existingMonthlyDebt: 0,
  requestedTermYears: 30,
};

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  cpiAnnual: 0.03,
  stressShockPoints: 2.0,
};

function rateFor(trackId: string): number {
  return DEFAULT_TRACKS.find((t) => t.id === trackId)!.defaultAnnualRate;
}

export const DEFAULT_MIX: Mix = {
  id: "custom",
  name: "My Mix",
  allocations: [
    { trackId: "fixed_unlinked", percent: 40, annualRate: rateFor("fixed_unlinked") },
    { trackId: "fixed_linked", percent: 20, annualRate: rateFor("fixed_linked") },
    { trackId: "prime", percent: 20, annualRate: rateFor("prime") },
    { trackId: "variable_linked_reset5", percent: 10, annualRate: rateFor("variable_linked_reset5") },
    { trackId: "variable_unlinked_reset5", percent: 10, annualRate: rateFor("variable_unlinked_reset5") },
  ],
};
