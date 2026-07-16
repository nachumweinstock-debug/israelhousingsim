import { softCardShadow } from "../../styles/brand";

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

export function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  const id = `select-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <label htmlFor={id} className="block">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/50">{label}</span>
      <div
        className="mt-1.5 rounded-2xl border border-warm-border bg-white px-4 py-3 transition-colors duration-150 focus-within:border-sky-accent"
        style={{ boxShadow: softCardShadow }}
      >
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent font-serif text-lg text-navy outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}
