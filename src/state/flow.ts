/**
 * Ordered definition of the question flow. Two steps are conditional:
 * aliyahDetails only exists when residency is "oleh", and
 * existingHomeStatus only exists when buyerStatus is "replacingHome".
 * Every navigation and progress computation goes through here so both
 * branches are skipped cleanly everywhere at once.
 */
import type { BuyerStatus, Residency } from "../lib/mortgageMath";

export const ALL_STEPS = [
  "welcome",
  "residency",
  "aliyahDetails",
  "buyerStatus",
  "existingHomeStatus",
  "incomeDebt",
  "propertyPrice",
  "downPayment",
  "downPaymentSource",
  "term",
  "trackMix",
  "costs",
  "creditStanding",
  "summary",
] as const;

export type StepId = (typeof ALL_STEPS)[number];

export interface FlowContext {
  residency: Residency | null;
  buyerStatus: BuyerStatus | null;
}

export function stepPath(step: StepId): string {
  return `/simulator/${step}`;
}

export function visibleSteps(ctx: FlowContext): StepId[] {
  return ALL_STEPS.filter((step) => {
    if (step === "aliyahDetails") return ctx.residency === "oleh";
    if (step === "existingHomeStatus") return ctx.buyerStatus === "replacingHome";
    return true;
  });
}

export function stepFromPath(pathname: string): StepId | null {
  const segment = pathname.replace(/\/+$/, "").split("/").pop() ?? "";
  return (ALL_STEPS as readonly string[]).includes(segment) ? (segment as StepId) : null;
}

export function nextStep(current: StepId, ctx: FlowContext): StepId | null {
  const steps = visibleSteps(ctx);
  const idx = steps.indexOf(current);
  if (idx === -1 || idx === steps.length - 1) return null;
  return steps[idx + 1];
}

export function prevStep(current: StepId, ctx: FlowContext): StepId | null {
  const steps = visibleSteps(ctx);
  const idx = steps.indexOf(current);
  if (idx <= 0) return null;
  return steps[idx - 1];
}

/** 0..1 progress through the visible flow, for the top progress bar. */
export function stepProgress(current: StepId, ctx: FlowContext): number {
  const steps = visibleSteps(ctx);
  const idx = Math.max(0, steps.indexOf(current));
  if (steps.length <= 1) return 1;
  return idx / (steps.length - 1);
}

/** Index in the full ordering, used to decide animation direction. */
export function stepOrderIndex(step: StepId): number {
  return ALL_STEPS.indexOf(step);
}
