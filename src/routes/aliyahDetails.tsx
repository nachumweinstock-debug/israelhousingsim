import { Navigate } from "react-router-dom";
import { ContinueButton, InfoNote, QuestionShell, Reveal } from "../components/QuestionShell";
import { AmountSlider } from "../components/inputs/AmountSlider";
import { ChoiceCard } from "../components/inputs/ChoiceCard";
import { useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";

export function AliyahDetails() {
  const residency = useSimulatorStore((state) => state.residency);
  const aliyahYears = useSimulatorStore((state) => state.aliyahYears);
  const setAliyahYears = useSimulatorStore((state) => state.setAliyahYears);
  const ownedBefore = useSimulatorStore((state) => state.ownedPropertyBefore);
  const setOwnedBefore = useSimulatorStore((state) => state.setOwnedPropertyBefore);
  const { goNext } = useFlowNav();

  // This branch only exists for olim, anyone else lands on the next step.
  if (residency !== "oleh") {
    return <Navigate to="/simulator/buyerStatus" replace />;
  }

  return (
    <QuestionShell
      title="Tell us about your aliyah."
      helper="Subsidized oleh benefits generally run for roughly the first 10 to 15 years after aliyah, depending on the program."
    >
      <Reveal className="rounded-2xl border border-hairline bg-card p-5 shadow-lift">
        <p className="mb-4 text-[15px] font-semibold text-ink">How many years since your aliyah?</p>
        <AmountSlider
          ariaLabel="Years since aliyah"
          value={aliyahYears}
          onChange={setAliyahYears}
          min={0}
          max={20}
          unit={aliyahYears === 1 ? "year" : "years"}
        />
        {aliyahYears > 10 ? (
          <p className="mt-3 text-[13px] leading-snug text-inkMuted">
            At {aliyahYears} years in, some benefit windows may be closing, worth confirming
            which programs still apply to you.
          </p>
        ) : null}
      </Reveal>

      <Reveal>
        <p className="mb-3 text-[15px] font-semibold text-ink">
          Have you owned property in Israel before?
        </p>
        <p className="mb-4 text-[13px] leading-snug text-inkMuted">
          Owning property in the past 10 years affects eligibility for the government backed
          Zakaut loan.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <ChoiceCard
            title="Yes"
            selected={ownedBefore === true}
            dimmed={ownedBefore === false}
            onSelect={() => setOwnedBefore(true)}
          />
          <ChoiceCard
            title="No"
            selected={ownedBefore === false}
            dimmed={ownedBefore === true}
            onSelect={() => setOwnedBefore(false)}
          />
        </div>
      </Reveal>

      <Reveal>
        <InfoNote>
          Olim can generally borrow up to 75% of the property value versus 50% for foreign
          residents, may be eligible for a small government backed loan at a reduced fixed rate,
          and often pay reduced purchase tax. This simulator gives an estimate only, a licensed
          mortgage advisor should confirm actual eligibility and terms.
        </InfoNote>
      </Reveal>

      <QuestionShellFooter disabled={ownedBefore === null} onContinue={goNext} />
    </QuestionShell>
  );
}

function QuestionShellFooter({
  disabled,
  onContinue,
}: {
  disabled: boolean;
  onContinue: () => void;
}) {
  return (
    <Reveal>
      <ContinueButton onClick={onContinue} disabled={disabled} />
    </Reveal>
  );
}
