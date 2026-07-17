import { useEffect, useState } from "react";
import type { MixResult } from "../types";
import { formatCurrency, formatPercent } from "../engine/format";
import { fmt, useLang } from "../i18n";
import { heroGradient } from "../styles/brand";

/**
 * Mortgage-health score: a presentation-layer summary of the regulatory
 * checks plus rate-risk exposure — NOT a bank metric, just a readable
 * roll-up of what the engine already computed. Fails dominate (-35 each),
 * warnings cost -12, and a wide baseline→stress payment gap costs up to -10.
 */
function healthScore(result: MixResult): number {
  let score = 100;
  for (const check of result.checks) {
    if (check.status === "fail") score -= 35;
    else if (check.status === "warn") score -= 12;
  }
  const ratio = result.paymentToday > 0 ? result.paymentStressed / result.paymentToday : 1;
  if (ratio > 1.25) score -= 10;
  else if (ratio > 1.15) score -= 5;
  return Math.max(5, Math.min(100, Math.round(score)));
}

// Tier colors follow the VryfID family accents (teal from the brand footer,
// sky from the demo palette) so the ring reads as the same product line as
// the vibe-score ring in vryfid-demo.
const TIER_COLORS = ["#5EEAD4", "#93C5FD", "#FBBF24", "#F87171"];

function tierIndex(score: number): number {
  if (score >= 85) return 0;
  if (score >= 65) return 1;
  if (score >= 40) return 2;
  return 3;
}

/** Animated score ring, ported from vryfid-demo's ScoreRing. */
function Ring({ score, color }: { score: number; color: string }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(score), 80);
    return () => clearTimeout(timer);
  }, [score]);

  const r = 48;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - displayed / 100);

  return (
    <div className="relative flex-shrink-0" style={{ width: 116, height: 116 }}>
      <svg width="116" height="116" viewBox="0 0 116 116" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="58" cy="58" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
        <circle
          cx="58"
          cy="58"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          strokeDashoffset={`${offset}`}
          style={{
            transition: "stroke-dashoffset 1.5s cubic-bezier(0.22,1,0.36,1)",
            filter: `drop-shadow(0 0 6px ${color}66)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif leading-none text-white" style={{ fontSize: "2rem", fontWeight: 700 }}>
          {score}
        </span>
        <span className="mt-0.5 text-[9px] uppercase tracking-widest text-white/40">/ 100</span>
      </div>
    </div>
  );
}

export function HealthPanel({ result }: { result: MixResult }) {
  const { t } = useLang();
  const score = healthScore(result);
  const tier = tierIndex(score);
  const color = TIER_COLORS[tier];

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8" style={{ background: heroGradient }}>
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-[360px] w-[360px] rounded-full opacity-[0.18] blur-3xl"
        style={{ background: "radial-gradient(circle, #3062BE, transparent)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[260px] w-[260px] rounded-full opacity-[0.12] blur-3xl"
        style={{ background: "radial-gradient(circle, #1A4A9C, transparent)" }}
      />

      <div className="relative flex flex-col items-center gap-7 sm:flex-row sm:items-center">
        <Ring score={score} color={color} />

        <div className="flex-1 text-center sm:text-start">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/35">
            {t.results.healthTitle}
          </p>
          <h3 className="mt-1 font-serif text-3xl leading-tight" style={{ color }}>
            {t.results.tiers[tier]}
          </h3>
          <p className="mt-1 text-xs text-white/40">{t.results.healthCaption}</p>

          <div className="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-4 sm:justify-start">
            <div>
              <div className="text-[10px] uppercase tracking-wide text-white/35">
                {t.results.paymentToday}
              </div>
              <div className="font-serif text-2xl tabular-nums text-white">
                {formatCurrency(result.paymentToday)}
                <span className="text-sm text-white/50">{t.results.perMonth}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-white/35">
                {t.results.highestExpected}
              </div>
              <div className="font-serif text-2xl tabular-nums" style={{ color: "#FBBF24" }}>
                {formatCurrency(result.paymentStressed)}
                <span className="text-sm text-white/50">{t.results.perMonth}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wide text-white/35">
                {t.results.totalInterest}
              </div>
              <div className="font-serif text-2xl tabular-nums text-white">
                {formatCurrency(result.totalInterestStressed)}
              </div>
              <div className="text-[11px] text-white/40">
                {fmt(t.results.baselinePrefix, { v: formatCurrency(result.totalInterestBaseline) })}
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-white/35">
            {fmt(t.wizard.loanLine, {
              loan: formatCurrency(result.loanAmount),
              ltv: formatPercent(result.ltv),
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
