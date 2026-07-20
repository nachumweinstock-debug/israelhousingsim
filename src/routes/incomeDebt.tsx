import { AnimatePresence, motion } from "framer-motion";
import { ContinueButton, QuestionShell, Reveal } from "../components/QuestionShell";
import { AmountSlider } from "../components/inputs/AmountSlider";
import { ChoiceCard } from "../components/inputs/ChoiceCard";
import { formatShekels } from "../lib/mortgageMath";
import type { EmploymentType } from "../lib/mortgageMath";
import { useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";
import { useSimLang } from "../state/useSimLang";

const EMPLOYMENT_ORDER: EmploymentType[] = ["salaried", "selfEmployed", "mixed"];
const EMPLOYMENT_EMOJI: Record<EmploymentType, string> = {
  salaried: "💼",
  selfEmployed: "🧾",
  mixed: "🔀",
};

export function IncomeDebt() {
  const income = useSimulatorStore((state) => state.income);
  const setIncome = useSimulatorStore((state) => state.setIncome);
  const { goNext } = useFlowNav();
  const { s } = useSimLang();

  return (
    <QuestionShell
      wide
      title={s.incomeDebt.title}
      helper={s.incomeDebt.helper}
      footer={<ContinueButton label={s.common.continueLabel} onClick={goNext} />}
    >
      <Reveal className="rounded-3xl border border-hairline bg-card p-7 shadow-lift">
        <p className="mb-4 text-[15px] font-semibold text-ink">{s.incomeDebt.incomeLabel}</p>
        <AmountSlider
          ariaLabel={s.incomeDebt.incomeLabel}
          value={income.applicantIncome}
          onChange={(applicantIncome) => setIncome({ applicantIncome })}
          min={0}
          max={80_000}
          step={500}
          format={formatShekels}
          editable
        />
      </Reveal>

      <Reveal className="rounded-3xl border border-hairline bg-card p-6 shadow-lift">
        <p className="mb-3 text-[15px] font-semibold text-ink">{s.incomeDebt.coApplicantToggle}</p>
        <div className="grid grid-cols-2 gap-3">
          <ChoiceCard
            title={s.common.yes}
            selected={income.hasCoApplicant}
            dimmed={!income.hasCoApplicant}
            onSelect={() => setIncome({ hasCoApplicant: true })}
          />
          <ChoiceCard
            title={s.common.no}
            selected={!income.hasCoApplicant}
            dimmed={income.hasCoApplicant}
            onSelect={() => setIncome({ hasCoApplicant: false })}
          />
        </div>
        <AnimatePresence>
          {income.hasCoApplicant ? (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 20 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <p className="mb-4 text-[15px] font-semibold text-ink">
                {s.incomeDebt.coApplicantIncomeLabel}
              </p>
              <AmountSlider
                ariaLabel={s.incomeDebt.coApplicantIncomeLabel}
                value={income.coApplicantIncome}
                onChange={(coApplicantIncome) => setIncome({ coApplicantIncome })}
                min={0}
                max={80_000}
                step={500}
                format={formatShekels}
                editable
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Reveal>

      <Reveal className="rounded-3xl border border-hairline bg-card p-6 shadow-lift">
        <p className="mb-3 text-[15px] font-semibold text-ink">{s.incomeDebt.employmentLabel}</p>
        <div className="space-y-3">
          {EMPLOYMENT_ORDER.map((value) => (
            <ChoiceCard
              key={value}
              title={s.incomeDebt[value]}
              emoji={EMPLOYMENT_EMOJI[value]}
              selected={income.employmentType === value}
              dimmed={income.employmentType !== value}
              onSelect={() => setIncome({ employmentType: value })}
            />
          ))}
        </div>
        <AnimatePresence>
          {income.employmentType !== "salaried" ? (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-[13px] leading-relaxed text-inkMuted"
            >
              {s.incomeDebt.employmentNoteSelfEmployed}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </Reveal>

      <Reveal className="rounded-3xl border border-hairline bg-card p-7 shadow-lift">
        <p className="mb-4 text-[15px] font-semibold text-ink">{s.incomeDebt.tenureLabel}</p>
        <AmountSlider
          ariaLabel={s.incomeDebt.tenureLabel}
          value={income.employerTenureYears}
          onChange={(employerTenureYears) => setIncome({ employerTenureYears })}
          min={0}
          max={30}
          unit={s.term.yearsUnit}
        />
        {income.employerTenureYears < 2 ? (
          <p className="mt-3 text-[13px] leading-relaxed text-inkMuted">
            {s.incomeDebt.tenureNoteShort}
          </p>
        ) : null}
      </Reveal>

      <Reveal className="rounded-3xl border border-hairline bg-card p-7 shadow-lift">
        <p className="mb-1 text-[15px] font-semibold text-ink">{s.incomeDebt.debtLabel}</p>
        <p className="mb-4 text-[13px] leading-snug text-inkMuted">{s.incomeDebt.debtNote}</p>
        <AmountSlider
          ariaLabel={s.incomeDebt.debtLabel}
          value={income.existingMonthlyDebt}
          onChange={(existingMonthlyDebt) => setIncome({ existingMonthlyDebt })}
          min={0}
          max={30_000}
          step={100}
          format={formatShekels}
          editable
        />
      </Reveal>
    </QuestionShell>
  );
}
