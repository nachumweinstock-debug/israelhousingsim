import { ContinueButton, QuestionShell, Reveal } from "../components/QuestionShell";
import { AmountSlider } from "../components/inputs/AmountSlider";
import { useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";

export function Term() {
  const termYears = useSimulatorStore((state) => state.termYears);
  const setTermYears = useSimulatorStore((state) => state.setTermYears);
  const { goNext } = useFlowNav();

  return (
    <QuestionShell
      title="Over how many years?"
      helper="25 years is the most common choice in Israel. Longer means lower monthly payments but more interest overall."
    >
      <Reveal className="rounded-2xl border border-hairline bg-card p-6 shadow-lift">
        <AmountSlider
          ariaLabel="Loan term in years"
          value={termYears}
          onChange={setTermYears}
          min={5}
          max={30}
          unit="years"
        />
      </Reveal>
      <Reveal>
        <ContinueButton onClick={goNext} />
      </Reveal>
    </QuestionShell>
  );
}
