import { ContinueButton, QuestionShell, Reveal } from "../components/QuestionShell";
import { AmountSlider } from "../components/inputs/AmountSlider";
import { formatShekels } from "../lib/mortgageMath";
import { useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";

export function PropertyPrice() {
  const propertyPrice = useSimulatorStore((state) => state.propertyPrice);
  const setPropertyPrice = useSimulatorStore((state) => state.setPropertyPrice);
  const { goNext } = useFlowNav();

  return (
    <QuestionShell
      title="What's the property price?"
      helper="A rough number is fine, you can come back and adjust it any time."
    >
      <Reveal className="rounded-2xl border border-hairline bg-card p-6 shadow-lift">
        <AmountSlider
          ariaLabel="Property price in shekels"
          value={propertyPrice}
          onChange={setPropertyPrice}
          min={500_000}
          max={10_000_000}
          step={10_000}
          format={formatShekels}
          editable
        />
      </Reveal>
      <Reveal>
        <ContinueButton onClick={goNext} />
      </Reveal>
    </QuestionShell>
  );
}
