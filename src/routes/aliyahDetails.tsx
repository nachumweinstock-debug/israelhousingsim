import { useRef } from "react";
import { Navigate } from "react-router-dom";
import { InfoNote, QuestionShell, Reveal } from "../components/QuestionShell";
import { AmountSlider } from "../components/inputs/AmountSlider";
import { ChoiceCard } from "../components/inputs/ChoiceCard";
import { fmt } from "../i18n";
import { useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";
import { useSimLang } from "../state/useSimLang";

export function AliyahDetails() {
  const residency = useSimulatorStore((state) => state.residency);
  const aliyahYears = useSimulatorStore((state) => state.aliyahYears);
  const setAliyahYears = useSimulatorStore((state) => state.setAliyahYears);
  const ownedBefore = useSimulatorStore((state) => state.ownedPropertyBefore);
  const setOwnedBefore = useSimulatorStore((state) => state.setOwnedPropertyBefore);
  const { goNext } = useFlowNav();
  const { s } = useSimLang();
  const advancing = useRef(false);

  // This branch only exists for olim, anyone else lands on the next step.
  if (residency !== "oleh") {
    return <Navigate to="/simulator/buyerStatus" replace />;
  }

  function pickOwned(value: boolean) {
    if (advancing.current) return;
    advancing.current = true;
    setOwnedBefore(value);
    window.setTimeout(goNext, 450);
  }

  return (
    <QuestionShell title={s.aliyah.title} helper={s.aliyah.helper}>
      <Reveal className="rounded-3xl border border-hairline bg-card p-6 shadow-lift">
        <p className="mb-4 text-[15px] font-semibold text-ink">{s.aliyah.yearsQuestion}</p>
        <AmountSlider
          ariaLabel={s.aliyah.yearsQuestion}
          value={aliyahYears}
          onChange={setAliyahYears}
          min={0}
          max={20}
          unit={aliyahYears === 1 ? s.aliyah.yearUnit : s.aliyah.yearsUnit}
        />
        {aliyahYears > 10 ? (
          <p className="mt-3 text-[13px] leading-snug text-inkMuted">
            {fmt(s.aliyah.lateWindowNote, { years: aliyahYears })}
          </p>
        ) : null}
      </Reveal>

      <Reveal>
        <InfoNote>{s.aliyah.infoNote}</InfoNote>
      </Reveal>

      <Reveal>
        <p className="mb-1 text-center text-[15px] font-semibold text-ink">
          {s.aliyah.ownedQuestion}
        </p>
        <p className="mb-4 text-center text-[13px] leading-snug text-inkMuted">
          {s.aliyah.ownedNote}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <ChoiceCard
            index={0}
            title={s.aliyah.yes}
            selected={ownedBefore === true}
            dimmed={ownedBefore === false}
            onSelect={() => pickOwned(true)}
          />
          <ChoiceCard
            index={1}
            title={s.aliyah.no}
            selected={ownedBefore === false}
            dimmed={ownedBefore === true}
            onSelect={() => pickOwned(false)}
          />
        </div>
      </Reveal>
    </QuestionShell>
  );
}
