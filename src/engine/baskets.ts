import type { Basket } from "../types";

/**
 * The three official comparison baskets every bank is required to quote.
 * These are computed through the exact same engine as the user's custom
 * mix (never a separate code path) so they stay guaranteed-consistent with
 * each other — see section 4, "Basket definition."
 */
export const BASKETS: Basket[] = [
  {
    id: "basket1",
    name: "Basket 1",
    description: "Entirely fixed, unindexed.",
    allocations: [{ trackId: "fixed_unlinked", percent: 100 }],
  },
  {
    id: "basket2",
    name: "Basket 2",
    description: "One third fixed unindexed, one third variable CPI-indexed (5yr reset), one third prime.",
    allocations: [
      { trackId: "fixed_unlinked", percent: 34 },
      { trackId: "variable_linked_reset5", percent: 33 },
      { trackId: "prime", percent: 33 },
    ],
  },
  {
    id: "basket3",
    name: "Basket 3",
    description: "One half fixed unindexed, one half prime.",
    allocations: [
      { trackId: "fixed_unlinked", percent: 50 },
      { trackId: "prime", percent: 50 },
    ],
  },
];
