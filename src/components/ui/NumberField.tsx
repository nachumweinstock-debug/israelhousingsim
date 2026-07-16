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
      <span className="text-sm font-medium text-navy">
        {label}
        {labelHe && <span className="ml-1.5 text-navy-mid/60" dir="rtl">({labelHe})</span>}
      </span>
      <div className="mt-1 flex items-center gap-2 rounded-lg border border-warm-border bg-white px-3 py-2 focus-within:border-sky-accent">
        <input
          id={id}
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step ?? 1}
          onChange={(e) => onChange(e.target.valueAsNumber || 0)}
          className="w-full bg-transparent text-navy outline-none"
        />
        {unit && <span className="shrink-0 text-xs text-navy-mid/70">{unit}</span>}
      </div>
    </label>
  );
}
