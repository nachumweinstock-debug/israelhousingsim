import { ContinueButton, QuestionShell, Reveal } from "../components/QuestionShell";
import { TrackMixBuilder } from "../components/inputs/TrackMixBuilder";
import {
  DTI_FRICTION_FLOOR,
  computeDti,
  computePlan,
  formatPct,
  formatShekels,
} from "../lib/mortgageMath";
import { loanAmountOf, totalIncomeOf, useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";
import { useSimLang } from "../state/useSimLang";

export function TrackMixStep() {
  const mix = useSimulatorStore((state) => state.mix);
  const setMix = useSimulatorStore((state) => state.setMix);
  const propertyPrice = useSimulatorStore((state) => state.propertyPrice);
  const downPayment = useSimulatorStore((state) => state.downPayment);
  const termYears = useSimulatorStore((state) => state.termYears);
  const inflation = useSimulatorStore((state) => state.inflation);
  const income = useSimulatorStore((state) => state.income);
  const { goNext } = useFlowNav();
  const { s } = useSimLang();

  const loanAmount = loanAmountOf({ propertyPrice, downPayment });
  const plan = computePlan({ loanAmount, termYears, mix, inflation });
  const dti = computeDti(plan.monthlyPayment, income.existingMonthlyDebt, totalIncomeOf(income));

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

      <Reveal className="flex items-center justify-between gap-4 rounded-3xl border border-accentSoft bg-accentSoft/25 px-6 py-5">
        <p className="text-[14px] font-semibold text-inkMuted">{s.mix.paymentPreview}</p>
        <p className="text-[26px] font-bold tabular-nums text-ink" dir="ltr">
          {formatShekels(plan.monthlyPayment)}
        </p>
      </Reveal>

      <Reveal className="rounded-3xl border border-hairline bg-card px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[14px] font-semibold text-inkMuted">{s.mix.dtiPreviewLabel}</p>
          <p className="text-[22px] font-bold tabular-nums text-ink" dir="ltr">
            {formatPct(dti)}
          </p>
        </div>
        {dti > DTI_FRICTION_FLOOR ? (
          <p className="mt-2 text-[13px] leading-relaxed text-warn">{s.mix.dtiWarning}</p>
        ) : null}
      </Reveal>

      <Reveal>
        <p className="text-center text-[13px] leading-relaxed text-inkMuted">
          {s.mix.inflationNote}
        </p>
      </Reveal>
    </QuestionShell>
  );
}
