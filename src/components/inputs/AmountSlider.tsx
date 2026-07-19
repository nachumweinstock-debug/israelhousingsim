import { useState } from "react";
import { palette } from "../../theme/palette.js";

interface AmountSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** Formats the big readout, defaults to a plain grouped number */
  format?: (value: number) => string;
  /** Small unit label rendered after the readout, e.g. "years" */
  unit?: string;
  /** Show an editable numeric field next to the readout */
  editable?: boolean;
  ariaLabel: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Big tap-friendly slider with a live formatted readout and an optional
 * numeric input kept in sync. The filled portion of the track is painted
 * in the accent color via a background gradient.
 */
export function AmountSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  format,
  unit,
  editable,
  ariaLabel,
}: AmountSliderProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const fillPct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const shown = format ? format(value) : new Intl.NumberFormat("en-US").format(value);

  function commitDraft() {
    if (draft !== null) {
      const parsed = Number(draft.replace(/[^\d.]/g, ""));
      if (!Number.isNaN(parsed) && draft.trim() !== "") onChange(clamp(parsed, min, max));
    }
    setDraft(null);
  }

  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="text-4xl font-bold tabular-nums tracking-tight text-ink sm:text-5xl">
          {shown}
          {unit ? <span className="ml-2 text-xl font-medium text-inkMuted">{unit}</span> : null}
        </div>
        {editable ? (
          <input
            type="text"
            inputMode="numeric"
            aria-label={`${ariaLabel} exact value`}
            className="noSpin w-36 rounded-xl border border-hairline bg-card px-3 py-2.5 text-right text-[15px] tabular-nums text-ink shadow-lift outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
            value={draft ?? new Intl.NumberFormat("en-US").format(value)}
            onFocus={() => setDraft(String(value))}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
          />
        ) : null}
      </div>
      <input
        type="range"
        aria-label={ariaLabel}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="sliderInput w-full"
        style={{
          background: `linear-gradient(to right, ${palette.accent} ${fillPct}%, ${palette.hairline} ${fillPct}%)`,
        }}
      />
      <div className="mt-2 flex justify-between text-[13px] tabular-nums text-inkMuted">
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  );
}
