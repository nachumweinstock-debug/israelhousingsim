import { ContinueButton, QuestionShell, Reveal } from "../components/QuestionShell";
import { TrackMixBuilder } from "../components/inputs/TrackMixBuilder";
import { computePlan, formatShekels } from "../lib/mortgageMath";
import { loanAmountOf, useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";
import { useSimLang } from "../state/useSimLang";

export function TrackMixStep() {
  const mix = useSimulatorStore((state) => state.mix);
  const setMix = useSimulatorStore((state) => state.setMix);
  const propertyPrice = useSimulatorStore((state) => state.propertyPrice);
  const downPayment = useSimulatorStore((state) => state.downPayment);
  const termYears = useSimulatorStore((state) => state.termYears);
  const inflation = useSimulatorStore((state) => state.inflation);
  const { goNext } = useFlowNav();
  const { s } = useSimLang();

  const loanAmount = loanAmountOf({ propertyPrice, downPayment });
  const plan = computePlan({ loanAmount, termYears, mix, inflation });

  return (
    <QuestionShell
      wide
      title={s.mix.title}
      helper={s.mix.helper}
      footer={<ContinueButton label={s.common.continueLabel} onClick={goNext} />}
    >
      <Reveal>
        <TrackMixBuilder mix={mix} onChange={setMix} loanAmount={loanAmount} />
      </Reveal>

      <Reveal className="flex items-center justify-between gap-4 rounded-2xl border border-accentSoft bg-accentSoft/25 px-5 py-4">
        <p className="text-[14px] font-semibold text-inkMuted">{s.mix.paymentPreview}</p>
        <p className="text-2xl font-bold tabular-nums text-ink">
          {formatShekels(plan.monthlyPayment)}
        </p>
      </Reveal>
    </QuestionShell>
  );
}
