import { ContinueButton, QuestionShell, Reveal } from "../components/QuestionShell";
import { AmountSlider } from "../components/inputs/AmountSlider";
import { formatShekels } from "../lib/mortgageMath";
import { useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";
import { useSimLang } from "../state/useSimLang";

export function PropertyPrice() {
  const propertyPrice = useSimulatorStore((state) => state.propertyPrice);
  const setPropertyPrice = useSimulatorStore((state) => state.setPropertyPrice);
  const { goNext } = useFlowNav();
  const { s } = useSimLang();

  return (
    <QuestionShell
      title={s.price.title}
      helper={s.price.helper}
      footer={<ContinueButton label={s.common.continueLabel} onClick={goNext} />}
    >
      <Reveal className="rounded-2xl border border-hairline bg-card p-6 shadow-lift">
        <AmountSlider
          ariaLabel={s.price.aria}
          value={propertyPrice}
          onChange={setPropertyPrice}
          min={500_000}
          max={10_000_000}
          step={10_000}
          format={formatShekels}
          editable
        />
      </Reveal>
    </QuestionShell>
  );
}
