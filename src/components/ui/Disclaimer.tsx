import { RULE_SET } from "../../engine/rules";

/**
 * Persistent, unobtrusive educational-simulation note (section 9). This is
 * core to the product's credibility, not legal boilerplate to hide —
 * overclaiming precision is the fastest way to lose trust with this
 * audience.
 */
export function Disclaimer() {
  return (
    <div className="border-t border-warm-border bg-warm-gray/60 px-4 py-2 text-center text-xs text-navy-mid/80">
      Educational simulation, not a bank quote — confirm figures with a licensed bank or advisor
      before committing. Regulatory figures as of {RULE_SET.effectiveDate}.
    </div>
  );
}
