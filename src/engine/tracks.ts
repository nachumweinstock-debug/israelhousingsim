import type { Track } from "../types";

/**
 * Default rate figures below are illustrative starting points for the
 * simulator, not live market data — every rate is user-editable in the mix
 * builder. See RULE_SET.effectiveDate for the "as of" freshness marker
 * shown in the UI (section 9, data freshness).
 */
export const DEFAULT_TRACKS: Track[] = [
  {
    id: "fixed_unlinked",
    name: "Fixed, Unindexed",
    nameHe: 'קבועה לא צמודה',
    rateType: "fixed",
    indexation: "unlinked",
    defaultAnnualRate: 0.055,
    penaltyOnPrepay: true,
  },
  {
    id: "fixed_linked",
    name: "Fixed, CPI-Indexed",
    nameHe: "קבועה צמודה למדד",
    rateType: "fixed",
    indexation: "linked",
    defaultAnnualRate: 0.033,
    penaltyOnPrepay: true,
  },
  {
    id: "prime",
    name: "Prime",
    nameHe: "פריים",
    rateType: "variable",
    indexation: "unlinked",
    resetIntervalYears: 0,
    defaultAnnualRate: 0.06,
    penaltyOnPrepay: false,
  },
  {
    id: "variable_linked_reset5",
    name: "Variable, CPI-Indexed (5yr reset)",
    nameHe: 'משתנה צמודה כל 5 שנים',
    rateType: "variable",
    indexation: "linked",
    resetIntervalYears: 5,
    defaultAnnualRate: 0.032,
    penaltyOnPrepay: false,
  },
  {
    id: "variable_unlinked_reset5",
    name: "Variable, Unindexed (5yr reset)",
    nameHe: 'משתנה לא צמודה כל 5 שנים',
    rateType: "variable",
    indexation: "unlinked",
    resetIntervalYears: 5,
    defaultAnnualRate: 0.05,
    penaltyOnPrepay: false,
  },
];

export function getTrack(trackId: string): Track {
  const track = DEFAULT_TRACKS.find((t) => t.id === trackId);
  if (!track) throw new Error(`Unknown track id: ${trackId}`);
  return track;
}
