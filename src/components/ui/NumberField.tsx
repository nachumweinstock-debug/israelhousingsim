import { softCardShadow } from "../../styles/brand";
import { FieldLabel } from "./FieldLabel";

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
      <FieldLabel label={label} labelHe={labelHe} />
      <div
        className="flex items-center gap-2 rounded-2xl border border-warm-border bg-white px-4 py-3 transition-colors duration-150 focus-within:border-sky-accent"
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
