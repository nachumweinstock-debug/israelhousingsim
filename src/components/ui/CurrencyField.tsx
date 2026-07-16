import { useState } from "react";
import { softCardShadow } from "../../styles/brand";

interface CurrencyFieldProps {
  label: string;
  labelHe?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}

function formatDigits(value: number): string {
  if (!Number.isFinite(value)) return "";
  return Math.round(value).toLocaleString("en-US");
}

/**
 * Comma-formatted currency input with a drag slider for quick adjustment.
 * Replaces the plain browser <input type="number"> that made large shekel
 * amounts (2000000) hard to read and slow to type.
 */
export function CurrencyField({ label, labelHe, value, onChange, min, max, step }: CurrencyFieldProps) {
  const [focused, setFocused] = useState(false);
  const id = `currency-${label.replace(/\s+/g, "-").toLowerCase()}`;

  function handleTextChange(raw: string) {
    const digits = raw.replace(/[^\d]/g, "");
    onChange(digits ? Number(digits) : 0);
  }

  return (
    <div>
      <label htmlFor={id} className="block">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/50">
          {label}
          {labelHe && (
            <span className="ml-1.5 normal-case tracking-normal text-navy-mid/50" dir="rtl">
              ({labelHe})
            </span>
          )}
        </span>
        <div
          className={`mt-1.5 flex items-center gap-2 rounded-2xl border bg-white px-4 py-3.5 transition-colors duration-150 ${
            focused ? "border-sky-accent" : "border-warm-border"
          }`}
          style={{ boxShadow: softCardShadow }}
        >
          <span className="shrink-0 font-serif text-lg text-navy/40">₪</span>
          <input
            id={id}
            type="text"
            inputMode="decimal"
            value={formatDigits(value)}
            onChange={(e) => handleTextChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full bg-transparent text-right font-serif text-2xl tabular-nums text-navy outline-none"
          />
        </div>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(Math.max(value, min), max)}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className="mt-3 w-full accent-navy"
        aria-label={`${label} slider`}
      />
    </div>
  );
}
