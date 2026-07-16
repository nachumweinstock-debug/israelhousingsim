import type { RegulatoryRuleSet } from "../types";

/**
 * The regulatory rule set is deliberately data, not logic (section 6) —
 * these figures move (LTV caps, PTI ceiling, the fixed/variable split, term
 * and age caps have all shifted in recent years and will again), so nothing
 * here should be hardcoded into calculation or validation functions.
 *
 * Figures below are representative of Bank of Israel Directive 329-era
 * norms. Verify current values with a bank or licensed advisor before
 * relying on them for a real application — this is explicitly NOT fetched
 * from a live source (see section 11 open question: local config vs backend
 * — resolved in favor of local config since the app ships with no backend).
 */
export const RULE_SET: RegulatoryRuleSet = {
  effectiveDate: "2026-07-16",
  source: "Representative of Bank of Israel Directive 329 norms — verify current figures with a bank/advisor",
  ltvCaps: {
    first_home: 0.75,
    replacement_home: 0.7,
    investment: 0.5,
    foreign_resident: 0.5,
    // Conservative default — some banks market higher figures for olim under
    // specific programs; verify per bank rather than assuming (section 6.1).
    oleh_chadash: 0.75,
  },
  ptiHardCeiling: 0.5,
  ptiCautionFloor: 1 / 3,
  minFixedShare: 1 / 3,
  maxVariableShare: 2 / 3,
  maxTermYears: 30,
  maxAgeAtPayoff: 80,
};
