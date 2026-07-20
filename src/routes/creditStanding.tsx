import { ContinueButton, QuestionShell, Reveal } from "../components/QuestionShell";
import { ChoiceCard } from "../components/inputs/ChoiceCard";
import { useSimulatorStore } from "../state/simulatorStore";
import type { CreditStandingAnswers } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";
import { useSimLang } from "../state/useSimLang";

type CreditQuestionKey = keyof CreditStandingAnswers;

const QUESTION_ORDER: CreditQuestionKey[] = ["missedPayments", "collections", "bankruptcy"];

export function CreditStanding() {
  const creditStanding = useSimulatorStore((state) => state.creditStanding);
  const setCreditStanding = useSimulatorStore((state) => state.setCreditStanding);
  const { goNext } = useFlowNav();
  const { s } = useSimLang();

  const questionText: Record<CreditQuestionKey, string> = {
    missedPayments: s.creditStanding.missedPaymentsQuestion,
    collections: s.creditStanding.collectionsQuestion,
    bankruptcy: s.creditStanding.bankruptcyQuestion,
  };

  const allAnswered = QUESTION_ORDER.every((key) => creditStanding[key] !== null);

  return (
    <QuestionShell
      title={s.creditStanding.title}
      helper={s.creditStanding.helper}
      footer={<ContinueButton label={s.common.continueLabel} onClick={goNext} disabled={!allAnswered} />}
    >
      {QUESTION_ORDER.map((key) => (
        <Reveal key={key} className="rounded-3xl border border-hairline bg-card p-6 shadow-lift">
          <p className="mb-3 text-[15px] font-semibold text-ink">{questionText[key]}</p>
          <div className="grid grid-cols-2 gap-3">
            <ChoiceCard
              title={s.creditStanding.yes}
              selected={creditStanding[key] === true}
              dimmed={creditStanding[key] === false}
              onSelect={() => setCreditStanding({ [key]: true })}
            />
            <ChoiceCard
              title={s.creditStanding.no}
              selected={creditStanding[key] === false}
              dimmed={creditStanding[key] === true}
              onSelect={() => setCreditStanding({ [key]: false })}
            />
          </div>
        </Reveal>
      ))}

      <Reveal>
        <p className="text-center text-[13px] leading-relaxed text-inkMuted">
          {s.creditStanding.disclosureNote}
        </p>
      </Reveal>
    </QuestionShell>
  );
}
