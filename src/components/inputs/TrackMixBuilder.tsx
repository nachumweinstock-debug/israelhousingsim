import { motion } from "framer-motion";
import { TRACK_INFO, formatPct, formatShekels } from "../../lib/mortgageMath";
import type { TrackKey, TrackMix } from "../../lib/mortgageMath";
import { PercentSlider } from "./PercentSlider";

const TRACK_KEYS: TrackKey[] = ["prime", "kalatz", "katz"];

const TRACK_BAR_CLASS: Record<TrackKey, string> = {
  prime: "bg-accent",
  kalatz: "bg-accentSoft",
  katz: "bg-accentMid",
};

export interface MixPreset {
  id: string;
  label: string;
  mix: TrackMix;
}

export const MIX_PRESETS: MixPreset[] = [
  { id: "balanced", label: "Balanced", mix: { prime: 33, kalatz: 34, katz: 33 } },
  { id: "stability", label: "Rate stability", mix: { prime: 20, kalatz: 60, katz: 20 } },
  { id: "lowestPayment", label: "Lowest payment", mix: { prime: 20, kalatz: 33, katz: 47 } },
];

/**
 * Moving one slider redistributes the remainder across the other two
 * tracks proportionally, so the mix always sums to exactly 100 and the
 * user never has to do the arithmetic themselves.
 */
export function rebalanceMix(mix: TrackMix, changed: TrackKey, rawValue: number): TrackMix {
  const value = Math.min(100, Math.max(0, Math.round(rawValue)));
  const [a, b] = TRACK_KEYS.filter((k) => k !== changed);
  const remainder = 100 - value;
  const currentOthers = mix[a] + mix[b];
  const shareA =
    currentOthers > 0 ? Math.round((remainder * mix[a]) / currentOthers) : Math.round(remainder / 2);
  return { ...mix, [changed]: value, [a]: shareA, [b]: remainder - shareA };
}

interface Guardrail {
  id: string;
  message: string;
}

/** Regulatory guardrails surfaced as gentle inline warnings, never hard blocks. */
export function mixGuardrails(mix: TrackMix): Guardrail[] {
  const warnings: Guardrail[] = [];
  if (mix.prime > 66) {
    warnings.push({
      id: "primeCap",
      message:
        "Bank of Israel rules cap Prime at two thirds of the mix, banks won't approve more than 66% here.",
    });
  }
  if (mix.kalatz + mix.katz < 33) {
    warnings.push({
      id: "fixedFloor",
      message:
        "At least a third of the mix has to sit in a fixed track (Kalatz or Katz), nudge one of them up.",
    });
  }
  return warnings;
}

interface TrackMixBuilderProps {
  mix: TrackMix;
  onChange: (mix: TrackMix) => void;
  loanAmount: number;
}

export function TrackMixBuilder({ mix, onChange, loanAmount }: TrackMixBuilderProps) {
  const warnings = mixGuardrails(mix);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {MIX_PRESETS.map((preset) => {
          const active = TRACK_KEYS.every((k) => mix[k] === preset.mix[k]);
          return (
            <motion.button
              key={preset.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange({ ...preset.mix })}
              className={`rounded-pill border px-4 py-2 text-[14px] font-semibold transition-colors ${
                active
                  ? "border-accent bg-accent text-white"
                  : "border-hairline bg-card text-ink hover:border-accent/60"
              }`}
            >
              {preset.label}
            </motion.button>
          );
        })}
      </div>

      <div
        className="flex h-3 w-full overflow-hidden rounded-pill border border-hairline"
        aria-hidden="true"
      >
        {TRACK_KEYS.map((key) => (
          <motion.div
            key={key}
            className={TRACK_BAR_CLASS[key]}
            animate={{ width: `${mix[key]}%` }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          />
        ))}
      </div>

      <div className="space-y-4">
        {TRACK_KEYS.map((key) => {
          const info = TRACK_INFO[key];
          return (
            <div key={key} className="rounded-2xl border border-hairline bg-card p-5 shadow-lift">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-pill ${TRACK_BAR_CLASS[key]}`}
                      aria-hidden="true"
                    />
                    <span className="text-[16px] font-semibold text-ink">
                      {info.name}
                      <span className="ml-1.5 font-normal text-inkMuted">{info.nameHe}</span>
                    </span>
                  </div>
                  <p className="mt-0.5 text-[13px] leading-snug text-inkMuted">{info.tagline}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-2xl font-bold tabular-nums text-ink">{mix[key]}%</div>
                  <div className="text-[12px] tabular-nums text-inkMuted">
                    {formatPct(info.annualRate, 1)} · {formatShekels(loanAmount * (mix[key] / 100))}
                  </div>
                </div>
              </div>
              <PercentSlider
                compact
                ariaLabel={`${info.name} share of the mix`}
                value={mix[key]}
                onChange={(value) => onChange(rebalanceMix(mix, key, value))}
              />
            </div>
          );
        })}
      </div>

      {warnings.map((warning) => (
        <motion.div
          key={warning.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-warn/25 bg-warn/5 px-4 py-3 text-[14px] leading-relaxed text-warn"
        >
          {warning.message}
        </motion.div>
      ))}
    </div>
  );
}
