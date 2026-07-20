import { motion } from "framer-motion";
import { TRACK_INFO, formatPct, formatShekels } from "../../lib/mortgageMath";
import type { TrackKey, TrackMix } from "../../lib/mortgageMath";
import { useSimLang } from "../../state/useSimLang";
import { PercentSlider } from "./PercentSlider";

const TRACK_KEYS: TrackKey[] = ["prime", "kalatz", "katz"];

const TRACK_BAR_CLASS: Record<TrackKey, string> = {
  prime: "bg-accent",
  kalatz: "bg-accentSoft",
  katz: "bg-accentMid",
};

export interface MixPreset {
  id: "balanced" | "stability" | "lowest";
  mix: TrackMix;
}

export const MIX_PRESETS: MixPreset[] = [
  { id: "balanced", mix: { prime: 33, kalatz: 34, katz: 33 } },
  { id: "stability", mix: { prime: 20, kalatz: 60, katz: 20 } },
  { id: "lowest", mix: { prime: 20, kalatz: 33, katz: 47 } },
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

interface TrackMixBuilderProps {
  mix: TrackMix;
  onChange: (mix: TrackMix) => void;
  loanAmount: number;
}

export function TrackMixBuilder({ mix, onChange, loanAmount }: TrackMixBuilderProps) {
  const { s } = useSimLang();

  const warnings: string[] = [];
  if (mix.prime > 66) warnings.push(s.mix.primeCapWarning);
  if (mix.kalatz + mix.katz < 33) warnings.push(s.mix.fixedFloorWarning);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-center gap-2">
        {MIX_PRESETS.map((preset) => {
          const active = TRACK_KEYS.every((k) => mix[k] === preset.mix[k]);
          return (
            <motion.button
              key={preset.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange({ ...preset.mix })}
              className={`rounded-pill border px-4 py-2 text-[14px] font-semibold transition-colors ${
                active
                  ? "border-accent bg-accent text-white"
                  : "border-hairline bg-card text-ink hover:border-accent/60"
              }`}
            >
              {s.mix.presets[preset.id]}
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
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>

      <div className="space-y-5">
        {TRACK_KEYS.map((key) => (
          <div key={key} className="rounded-3xl border border-hairline bg-card p-6 shadow-lift">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-pill ${TRACK_BAR_CLASS[key]}`}
                    aria-hidden="true"
                  />
                  <span className="text-[17px] font-semibold text-ink">{s.tracks[key].name}</span>
                </div>
                <p className="mt-0.5 text-[14px] leading-snug text-inkMuted">
                  {s.tracks[key].tagline}
                </p>
              </div>
              <div className="shrink-0 text-end">
                <div className="text-[26px] font-bold tabular-nums text-ink">{mix[key]}%</div>
                <div className="text-[12px] tabular-nums text-inkMuted" dir="ltr">
                  {formatPct(TRACK_INFO[key].annualRate, 1)} ·{" "}
                  {formatShekels(loanAmount * (mix[key] / 100))}
                </div>
              </div>
            </div>
            <PercentSlider
              compact
              ariaLabel={s.tracks[key].name}
              value={mix[key]}
              onChange={(value) => onChange(rebalanceMix(mix, key, value))}
            />
          </div>
        ))}
      </div>

      {warnings.map((warning) => (
        <motion.div
          key={warning}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-warn/25 bg-warn/5 px-5 py-4 text-[14px] leading-relaxed text-warn"
        >
          {warning}
        </motion.div>
      ))}
    </div>
  );
}
