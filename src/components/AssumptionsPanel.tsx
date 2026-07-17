import type { Assumptions } from "../types";
import { useLang } from "../i18n";
import { NumberField } from "./ui/NumberField";

export function AssumptionsPanel({
  assumptions,
  onChange,
}: {
  assumptions: Assumptions;
  onChange: (a: Assumptions) => void;
}) {
  const { t } = useLang();
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <NumberField
          label="Expected annual CPI"
          labelHe="מדד שנתי צפוי"
          value={assumptions.cpiAnnual * 100}
          onChange={(v) => onChange({ ...assumptions, cpiAnnual: v / 100 })}
          unit={t.assumptions.cpiUnit}
          min={0}
          max={15}
          step={0.1}
        />
        <NumberField
          label="Stress test rate shock"
          labelHe="תרחיש קיצון — עליית ריבית"
          value={assumptions.stressShockPoints}
          onChange={(v) => onChange({ ...assumptions, stressShockPoints: v })}
          unit={t.assumptions.shockUnit}
          min={0}
          max={10}
          step={0.25}
        />
      </div>
      <p className="text-sm text-navy-mid/70">{t.assumptions.para1}</p>
      <p className="text-xs text-navy-mid/60">{t.assumptions.para2}</p>
    </div>
  );
}
