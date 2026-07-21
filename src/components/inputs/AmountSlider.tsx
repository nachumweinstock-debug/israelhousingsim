import { useState } from "react";
import { palette } from "../../theme/palette.js";
import { useSimLang } from "../../state/useSimLang";

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
  const { isHe } = useSimLang();
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
          {/* Before: ml-2 (margin-left) put the gap on the physical left, which
              sits on the wrong side of the unit label once the row flips to
              flow right-to-left in Hebrew. After: ms-2 (margin-inline-start)
              always sits between the number and its unit regardless of
              direction, matching the pattern used elsewhere (ChoiceCard's
              pe-16/start-0/end-6). */}
          {unit ? <span className="ms-2 text-xl font-medium text-inkMuted">{unit}</span> : null}
        </div>
        {editable ? (
          <input
            type="text"
            inputMode="numeric"
            dir="ltr"
            aria-label={`${ariaLabel} exact value`}
            /* Before: no dir attribute, so this numeric field inherited
               dir="rtl" in Hebrew, which can make arrow-key/backspace cursor
               movement inside a purely-digit value feel reversed (the same
               "numeric input cursor behavior" bug class costs.tsx's
               CostField already handles correctly with its own dir="ltr").
               text-right -> text-end so the alignment stays correct even
               though direction is now pinned to ltr on this element. */
            className="noSpin w-36 rounded-xl border border-hairline bg-card px-3 py-2.5 text-end text-[15px] tabular-nums text-ink shadow-lift outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
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
          // Before: hardcoded "to right", so the accent fill always painted
          // from the physical left regardless of language. The browser does
          // mirror the native thumb's position for dir="rtl" (min/max swap
          // sides), but it does NOT mirror a manually painted CSS gradient,
          // so the two visibly disagreed in Hebrew: a low value showed a
          // mostly-filled bar hugging the max/left end instead of a mostly
          // empty bar hugging the min/right end where the thumb actually
          // sits. After: flip the gradient direction to match, painting the
          // fill from whichever side is actually the min end.
          background: `linear-gradient(to ${isHe ? "left" : "right"}, ${palette.accent} ${fillPct}%, ${palette.hairline} ${fillPct}%)`,
        }}
      />
      <div className="mt-2 flex justify-between text-[13px] tabular-nums text-inkMuted">
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  );
}
