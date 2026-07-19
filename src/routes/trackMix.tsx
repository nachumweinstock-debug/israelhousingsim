import { ContinueButton, QuestionShell, Reveal } from "../components/QuestionShell";
import { TrackMixBuilder } from "../components/inputs/TrackMixBuilder";
import { computePlan, formatShekels } from "../lib/mortgageMath";
import { loanAmountOf, useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";

export function TrackMixStep() {
  const mix = useSimulatorStore((state) => state.mix);
  const setMix = useSimulatorStore((state) => state.setMix);
  const propertyPrice = useSimulatorStore((state) => state.propertyPrice);
  const downPayment = useSimulatorStore((state) => state.downPayment);
  const termYears = useSimulatorStore((state) => state.termYears);
  const inflation = useSimulatorStore((state) => state.inflation);
  const { goNext } = useFlowNav();

  const loanAmount = loanAmountOf({ propertyPrice, downPayment });
  const plan = computePlan({ loanAmount, termYears, mix, inflation });

  return (
    <QuestionShell
      wide
      title="Build your track mix."
      helper="Israeli mortgages are split across tracks, each with its own rate behavior. Most people blend all three, start from a preset and drag to taste."
    >
      <Reveal>
        <TrackMixBuilder mix={mix} onChange={setMix} loanAmount={loanAmount} />
      </Reveal>

      <Reveal className="flex items-center justify-between rounded-2xl border border-accentSoft bg-accentSoft/25 px-5 py-4">
        <p className="text-[14px] font-semibold text-inkMuted">
          Estimated monthly payment with this mix
        </p>
        <p className="text-2xl font-bold tabular-nums text-ink">
          {formatShekels(plan.monthlyPayment)}
        </p>
      </Reveal>

      <Reveal>
        <ContinueButton onClick={goNext} />
      </Reveal>
    </QuestionShell>
  );
}
