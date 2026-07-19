import { palette } from "../../theme/palette.js";

interface PercentSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  ariaLabel: string;
  /** Compact mode drops the min/max caption row (used inside track cards) */
  compact?: boolean;
}

/** Percentage slider with the accent-filled track. Readout is the caller's job in compact mode. */
export function PercentSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  ariaLabel,
  compact,
}: PercentSliderProps) {
  const fillPct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div>
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
      {compact ? null : (
        <div className="mt-2 flex justify-between text-[13px] tabular-nums text-inkMuted">
          <span>{min}%</span>
          <span>{max}%</span>
        </div>
      )}
    </div>
  );
}
