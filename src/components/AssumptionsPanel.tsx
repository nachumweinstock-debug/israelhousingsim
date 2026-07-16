import type { Assumptions } from "../types";
import { NumberField } from "./ui/NumberField";

export function AssumptionsPanel({
  assumptions,
  onChange,
}: {
  assumptions: Assumptions;
  onChange: (a: Assumptions) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <NumberField
          label="Expected annual CPI"
          labelHe="ציפיות אינפלציה"
          value={assumptions.cpiAnnual * 100}
          onChange={(v) => onChange({ ...assumptions, cpiAnnual: v / 100 })}
          unit="%/yr"
          min={0}
          max={15}
          step={0.1}
        />
        <NumberField
          label="Stress test rate shock"
          labelHe="תרחיש קיצון"
          value={assumptions.stressShockPoints}
          onChange={(v) => onChange({ ...assumptions, stressShockPoints: v })}
          unit="pp"
          min={0}
          max={10}
          step={0.25}
        />
      </div>
      <p className="text-sm text-navy-mid/70">
        The CPI assumption compounds into every CPI-indexed track's projected payment and total
        interest. The stress shock is added to every variable/reset-eligible track's rate (prime
        immediately, 5-year reset tracks from their reset point forward) to compute the "highest
        expected payment" scenario.
      </p>
      <p className="text-xs text-navy-mid/60">
        Live Bank of Israel policy rate integration is planned for a later phase — for now, set
        these manually based on your own expectations.
      </p>
    </div>
  );
}
