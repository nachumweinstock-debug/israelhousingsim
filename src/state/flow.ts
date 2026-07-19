/**
 * Ordered definition of the question flow. The aliyahDetails step only
 * exists in the flow when the user picked oleh chadash on the residency
 * step; every navigation and progress computation goes through here so
 * the branch is skipped cleanly everywhere at once.
 */
import type { Residency } from "../lib/mortgageMath";

export const ALL_STEPS = [
  "welcome",
  "residency",
  "aliyahDetails",
  "buyerStatus",
  "propertyPrice",
  "downPayment",
  "term",
  "trackMix",
  "inflationScenario",
  "costs",
  "summary",
] as const;

export type StepId = (typeof ALL_STEPS)[number];

export function stepPath(step: StepId): string {
  return `/simulator/${step}`;
}

export function visibleSteps(residency: Residency | null): StepId[] {
  if (residency === "oleh") return [...ALL_STEPS];
  return ALL_STEPS.filter((step) => step !== "aliyahDetails");
}

export function stepFromPath(pathname: string): StepId | null {
  const segment = pathname.replace(/\/+$/, "").split("/").pop() ?? "";
  return (ALL_STEPS as readonly string[]).includes(segment) ? (segment as StepId) : null;
}

export function nextStep(current: StepId, residency: Residency | null): StepId | null {
  const steps = visibleSteps(residency);
  const idx = steps.indexOf(current);
  if (idx === -1 || idx === steps.length - 1) return null;
  return steps[idx + 1];
}

export function prevStep(current: StepId, residency: Residency | null): StepId | null {
  const steps = visibleSteps(residency);
  const idx = steps.indexOf(current);
  if (idx <= 0) return null;
  return steps[idx - 1];
}

/** 0..1 progress through the visible flow, for the top progress bar. */
export function stepProgress(current: StepId, residency: Residency | null): number {
  const steps = visibleSteps(residency);
  const idx = Math.max(0, steps.indexOf(current));
  if (steps.length <= 1) return 1;
  return idx / (steps.length - 1);
}

/** Index in the full ordering, used to decide animation direction. */
export function stepOrderIndex(step: StepId): number {
  return ALL_STEPS.indexOf(step);
}
