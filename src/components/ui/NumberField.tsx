import { softCardShadow } from "../../styles/brand";

interface NumberFieldProps {
  label: string;
  labelHe?: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

/** Every numeric input needs a clear label and unit (section 9, accessibility). */
export function NumberField({ label, labelHe, value, onChange, unit, min, max, step }: NumberFieldProps) {
  const id = `field-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
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
        className="mt-1.5 flex items-center gap-2 rounded-2xl border border-warm-border bg-white px-4 py-3 transition-colors duration-150 focus-within:border-sky-accent"
        style={{ boxShadow: softCardShadow }}
      >
        <input
          id={id}
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step ?? 1}
          onChange={(e) => onChange(e.target.valueAsNumber || 0)}
          className="w-full bg-transparent font-serif text-lg text-navy outline-none"
        />
        {unit && <span className="shrink-0 text-xs font-medium text-navy-mid/60">{unit}</span>}
      </div>
    </label>
  );
}
