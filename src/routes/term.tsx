import { ContinueButton, QuestionShell, Reveal } from "../components/QuestionShell";
import { AmountSlider } from "../components/inputs/AmountSlider";
import { useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";
import { useSimLang } from "../state/useSimLang";

export function Term() {
  const termYears = useSimulatorStore((state) => state.termYears);
  const setTermYears = useSimulatorStore((state) => state.setTermYears);
  const { goNext } = useFlowNav();
  const { s } = useSimLang();

  return (
    <QuestionShell
      title={s.term.title}
      helper={s.term.helper}
      footer={<ContinueButton label={s.common.continueLabel} onClick={goNext} />}
    >
      <Reveal className="rounded-3xl border border-hairline bg-card p-7 shadow-lift">
        <AmountSlider
          ariaLabel={s.term.title}
          value={termYears}
          onChange={setTermYears}
          min={5}
          max={30}
          unit={s.term.yearsUnit}
        />
      </Reveal>
    </QuestionShell>
  );
}
