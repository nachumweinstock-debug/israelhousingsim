/**
 * Shared visual treatments pulled from the Vryfid product family (see
 * vryfid-demo/src/App.jsx) so every component uses the exact same gradients,
 * shadows, and easing rather than one-off approximations.
 */
import type { CSSProperties } from "react";

export const heroGradient = "linear-gradient(160deg, #1A3868 0%, #0D2144 55%, #081830 100%)";

export const softCardGradient = "linear-gradient(160deg, #FAFAF8 0%, #F3EDE3 100%)";
export const softCardBorder = "1px solid rgba(27,58,107,0.07)";
export const softCardShadow = "0 2px 8px rgba(27,58,107,0.06)";

export const navySelectedShadow = "0 8px 28px rgba(27,58,107,0.32), 0 2px 6px rgba(27,58,107,0.18)";

export const pillCtaShadow = "0 8px 32px rgba(0,0,0,0.28), 0 2px 0 rgba(255,255,255,0.25) inset";

export const easeOutBack = "cubic-bezier(0.16, 1, 0.3, 1)";
export const easeSmooth = "cubic-bezier(0.22, 1, 0.36, 1)";

export function glow(color: string): string {
  return `drop-shadow(0 0 6px ${color}66)`;
}

/** Staggered entrance delay helper, matching the cascading reveal pattern
 * used throughout vryfid-demo (0.05s increments). */
export function revealDelay(index: number): CSSProperties {
  return { animationDelay: `${index * 0.06}s` };
}
