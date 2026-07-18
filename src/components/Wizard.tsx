import { useMemo, useState, type ReactNode } from "react";
import { track } from "@vercel/analytics";
import type { Assumptions, BorrowerProfile, BuyerCategory, Mix } from "../types";
import { TrackMixBuilder } from "./TrackMixBuilder";
import { CurrencyField } from "./ui/CurrencyField";
import { computeLoanAmount, computeLtv } from "../engine/validation";
import { computeMixResult } from "../engine/mix";
import { basketToMix } from "../engine/baskets";
import { getTrack } from "../engine/tracks";
import { RULE_SET } from "../engine/rules";
import { formatCurrency, formatPercent } from "../engine/format";
import { fmt, useLang } from "../i18n";
import { navySelectedShadow, softCardBorder, softCardGradient, softCardShadow } from "../styles/brand";

type StepId = "category" | "price" | "equity" | "income" | "debt" | "age" | "mix";

function getSteps(): StepId[] {
  return ["category", "price", "equity", "income", "debt", "age", "mix"];
}

const CATEGORY_VALUES: BuyerCategory[] = [
  "first_home",
  "replacement_home",
  "investment",
  "foreign_resident",
  "oleh_chadash",
];

const PRICE_VALUES = [1_300_000, 1_750_000, 2_250_000, 3_000_000, 4_000_000];
const EQUITY_MID_PCTS = [0.08, 0.175, 0.32, 0.5];
const INCOME_VALUES = [8_000, 12_500, 17_500, 25_000, 35_000];
const DEBT_VALUES = [0, 500, 2_000, 4_000, 6_000];
const AGE_MIN = 18;
const AGE_MAX = 90;

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-300 ${
            i < current ? "w-5 bg-navy" : i === current ? "w-9 bg-navy" : "w-3 bg-warm-border"
          }`}
        />
      ))}
    </div>
  );
}

function WizardShell({
  stepIndex,
  total,
  onBack,
  children,
}: {
  stepIndex: number;
  total: number;
  onBack?: () => void;
  children: ReactNode;
}) {
  const { t } = useLang();
  return (
    <div className="flex min-h-[calc(100vh-1px)] flex-col bg-cream">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 pt-8">
        <button
          onClick={onBack}
          disabled={!onBack}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            onBack ? "text-navy-mid/60 hover:text-navy" : "invisible"
          }`}
        >
          <svg
            className="h-4 w-4 rtl:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t.wizard.back}
        </button>
        <ProgressDots total={total} current={stepIndex} />
        <span className="w-10 text-end text-xs text-navy-mid/40">
          {stepIndex + 1}/{total}
        </span>
      </div>
      <div className="mx-auto mt-5 h-1 w-full max-w-sm overflow-hidden rounded-full bg-white">
        <div
          key={stepIndex}
          className="h-full rounded-full bg-sky-accent wizard-progress-sweep"
          style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
        />
      </div>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-10">
        <div key={stepIndex} className="wizard-question-stage">
          {children}
        </div>
      </div>
    </div>
  );
}

function QuestionHeader({
  eyebrow,
  question,
  subtitle,
}: {
  eyebrow: string;
  question: string;
  subtitle?: string;
}) {
  return (
    <>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/40">{eyebrow}</p>
      <h2 className="mb-2 font-serif text-3xl leading-tight text-navy sm:text-4xl">{question}</h2>
      {subtitle ? <p className="mb-6 text-sm text-navy-mid/60">{subtitle}</p> : <div className="mb-8" />}
    </>
  );
}

function OptionCard({
  label,
  sub,
  selected,
  onClick,
}: {
  label: string;
  sub?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border-2 px-5 py-4 text-start transition-all duration-200 active:scale-[0.98] ${
        selected ? "border-navy bg-navy" : "border-warm-border bg-white hover:border-navy hover:shadow-md"
      }`}
      style={selected ? { boxShadow: navySelectedShadow } : { boxShadow: softCardShadow }}
    >
      <p className={`text-sm font-semibold leading-snug ${selected ? "text-white" : "text-navy"}`}>{label}</p>
      {sub && <p className={`mt-0.5 text-xs ${selected ? "text-white/60" : "text-navy-mid/60"}`}>{sub}</p>}
    </button>
  );
}

/** One big tappable question — tap an answer, brief selected flash, auto-advance. */
function ChoiceStep<T>({
  eyebrow,
  question,
  subtitle,
  options,
  onAdvance,
}: {
  eyebrow: string;
  question: string;
  subtitle?: string;
  options: Array<{ value: T; label: string; sub?: string }>;
  onAdvance: (v: T) => void;
}) {
  const [pendingIdx, setPendingIdx] = useState<number | null>(null);

  function select(idx: number, v: T) {
    setPendingIdx(idx);
    setTimeout(() => onAdvance(v), 200);
  }

  return (
    <div className="mb-reveal">
      <QuestionHeader eyebrow={eyebrow} question={question} subtitle={subtitle} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((opt, i) => (
          <OptionCard
            key={i}
            label={opt.label}
            sub={opt.sub}
            selected={pendingIdx === i}
            onClick={() => select(i, opt.value)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Two-phase money question: tap a range (fast, Kahoot-style), then confirm
 * or fine-tune the exact shekel figure before continuing — so the flow
 * stays simple but every ratio downstream (PTI, LTV) runs on a real number,
 * never a rounded guess. Options with skipExact (e.g. debt "None") advance
 * immediately since there's nothing to refine about zero.
 */
function RangeExactStep({
  eyebrow,
  question,
  subtitle,
  fieldLabel,
  options,
  min,
  max,
  step,
  onContinue,
}: {
  eyebrow: string;
  question: string;
  subtitle?: string;
  fieldLabel: string;
  options: Array<{ value: number; label: string; sub?: string; skipExact?: boolean }>;
  min: number;
  max: number;
  step: number;
  onContinue: (v: number) => void;
}) {
  const { t } = useLang();
  const [pendingIdx, setPendingIdx] = useState<number | null>(null);
  const [exact, setExact] = useState<number | null>(null);

  function select(idx: number, opt: { value: number; skipExact?: boolean }) {
    setPendingIdx(idx);
    setTimeout(() => {
      if (opt.skipExact) onContinue(opt.value);
      else setExact(opt.value);
    }, 200);
  }

  if (exact === null) {
    return (
      <div className="mb-reveal">
        <QuestionHeader eyebrow={eyebrow} question={question} subtitle={subtitle} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((opt, i) => (
            <OptionCard
              key={i}
              label={opt.label}
              sub={opt.sub}
              selected={pendingIdx === i}
              onClick={() => select(i, opt)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-reveal">
      <QuestionHeader eyebrow={t.wizard.exactEyebrow} question={t.wizard.exactHeading} subtitle={t.wizard.exactHint} />
      <CurrencyField label={fieldLabel} value={exact} onChange={setExact} min={min} max={max} step={step} />
      <button
        onClick={() => onContinue(exact)}
        className="mt-6 w-full rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-cream transition-all duration-200 active:scale-[0.98] sm:w-auto"
        style={{ boxShadow: navySelectedShadow }}
      >
        {t.wizard.continue}
      </button>
      <button
        onClick={() => {
          setExact(null);
          setPendingIdx(null);
        }}
        className="mt-3 block text-sm text-navy-mid/60 transition-colors hover:text-navy"
      >
        {t.wizard.pickDifferentRange}
      </button>
    </div>
  );
}

function SliderExactStep({
  eyebrow,
  question,
  subtitle,
  value,
  min,
  max,
  unit,
  onContinue,
}: {
  eyebrow: string;
  question: string;
  subtitle?: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onContinue: (v: number) => void;
}) {
  const { t } = useLang();
  const [exact, setExact] = useState(() => Math.min(Math.max(value, min), max));

  function update(next: number) {
    if (!Number.isFinite(next)) return;
    setExact(Math.min(Math.max(Math.round(next), min), max));
  }

  return (
    <div className="mb-reveal">
      <QuestionHeader eyebrow={eyebrow} question={question} subtitle={subtitle} />
      <div
        className="rounded-2xl border border-warm-border bg-white p-5"
        style={{ boxShadow: softCardShadow }}
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-serif text-5xl tabular-nums text-navy">{exact}</p>
            <p className="mt-1 text-sm text-navy-mid/60">{unit}</p>
          </div>
          <input
            type="number"
            min={min}
            max={max}
            value={exact}
            onChange={(e) => update(e.target.valueAsNumber)}
            className="w-24 rounded-xl border border-warm-border bg-warm-gray px-3 py-2 text-center font-serif text-xl tabular-nums text-navy outline-none transition-colors focus:border-sky-accent"
            aria-label={question}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={exact}
          onChange={(e) => update(e.target.valueAsNumber)}
          className="mt-6 w-full accent-navy"
          aria-label={`${question} slider`}
        />
        <div className="mt-2 flex justify-between text-xs text-navy-mid/45">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
      <button
        onClick={() => onContinue(exact)}
        className="mt-6 w-full rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-cream transition-all duration-200 active:scale-[0.98] sm:w-auto"
        style={{ boxShadow: navySelectedShadow }}
      >
        {t.wizard.continue}
      </button>
    </div>
  );
}

function MixStep({
  profile,
  assumptions,
  mix,
  onChange,
  onComplete,
}: {
  profile: BorrowerProfile;
  assumptions: Assumptions;
  mix: Mix;
  onChange: (m: Mix) => void;
  onComplete: () => void;
}) {
  const { t, lang } = useLang();
  const [customizing, setCustomizing] = useState(false);
  const recommended = useMemo(() => basketToMix("basket2"), []);
  const recommendedResult = useMemo(
    () => computeMixResult(recommended, profile, assumptions, RULE_SET),
    [recommended, profile, assumptions]
  );
  const loanAmount = computeLoanAmount(profile);
  const ltv = computeLtv(profile);

  function useRecommended() {
    onChange(recommended);
    onComplete();
  }

  return (
    <div className="mb-reveal">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/40">
        {t.wizard.eyebrowMix}
      </p>
      <h2 className="mb-2 font-serif text-3xl leading-tight text-navy sm:text-4xl">{t.wizard.qMix}</h2>
      <p className="mb-6 text-sm text-navy-mid/60">
        {fmt(t.wizard.loanLine, { loan: formatCurrency(loanAmount), ltv: formatPercent(ltv) })}
      </p>

      {!customizing && (
        <>
          <div
            className="rounded-2xl p-5"
            style={{ background: softCardGradient, border: softCardBorder, boxShadow: softCardShadow }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy/45">
              {t.wizard.recommendedTitle}
            </p>
            <p className="mt-1 text-sm text-navy-mid/70">{t.wizard.recommendedDesc}</p>
            <div className="mt-4 flex gap-6">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-navy/40">{t.wizard.paymentToday}</div>
                <div className="font-serif text-xl tabular-nums text-navy">
                  {formatCurrency(recommendedResult.paymentToday)}/mo
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-navy/40">
                  {t.wizard.highestExpected}
                </div>
                <div className="font-serif text-xl tabular-nums text-navy">
                  {formatCurrency(recommendedResult.paymentStressed)}/mo
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-navy/10 pt-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-navy/40">
                {t.wizard.whatsInside}
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-start text-[10px] uppercase tracking-wide text-navy/40">
                    <th className="pb-1.5 text-start">{t.wizard.trackCol}</th>
                    <th className="pb-1.5 text-start">{t.wizard.shareCol}</th>
                    <th className="pb-1.5 text-start">{t.wizard.rateCol}</th>
                    <th className="pb-1.5 text-start">{t.wizard.paymentCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendedResult.trackResults.map((r) => {
                    const track = getTrack(r.trackId);
                    const alloc = recommended.allocations.find((a) => a.trackId === r.trackId);
                    return (
                      <tr key={r.trackId} className="border-t border-navy/5">
                        <td className="py-1.5 pe-2 font-medium text-navy">
                          {lang === "he" ? track.nameHe : track.name}
                        </td>
                        <td className="py-1.5 tabular-nums text-navy-mid/75">{alloc?.percent}%</td>
                        <td className="py-1.5 tabular-nums text-navy-mid/75">
                          {((alloc?.annualRate ?? 0) * 100).toFixed(2)}%
                        </td>
                        <td className="py-1.5 tabular-nums text-navy-mid/75">
                          {formatCurrency(r.paymentToday)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={useRecommended}
            className="mt-5 w-full rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-cream transition-all duration-200 active:scale-[0.98]"
            style={{ boxShadow: navySelectedShadow }}
          >
            {t.wizard.useMix}
          </button>
          <button
            onClick={() => setCustomizing(true)}
            className="mt-3 w-full rounded-full border border-warm-border bg-white px-6 py-3 text-sm font-semibold text-navy-mid/70 transition-colors hover:border-navy hover:text-navy"
          >
            {t.wizard.customize}
          </button>
        </>
      )}

      {customizing && (
        <>
          <TrackMixBuilder mix={mix} onChange={onChange} />
          <button
            onClick={onComplete}
            className="mt-6 w-full rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-cream transition-all duration-200 active:scale-[0.98] sm:w-auto"
            style={{ boxShadow: navySelectedShadow }}
          >
            {t.wizard.finish}
          </button>
        </>
      )}
    </div>
  );
}

export function Wizard({
  profile,
  setProfile,
  mix,
  setMix,
  assumptions,
  onComplete,
}: {
  profile: BorrowerProfile;
  setProfile: (p: BorrowerProfile) => void;
  mix: Mix;
  setMix: (m: Mix) => void;
  assumptions: Assumptions;
  onComplete: () => void;
}) {
  const { t } = useLang();
  const steps = getSteps();
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];

  function trackStep(step: StepId, detail?: Record<string, string | number | boolean>) {
    track("wizard_step_completed", { step, ...detail });
  }

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }
  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  // Equity options carry the actual shekel amounts implied by the price the
  // user just picked, so "10% – 25%" is never an abstract percentage.
  const equityAmounts = {
    a10: formatCurrency(profile.propertyPrice * 0.1),
    a25: formatCurrency(profile.propertyPrice * 0.25),
    a40: formatCurrency(profile.propertyPrice * 0.4),
  };
  const equitySubVars = [
    { a: equityAmounts.a10, b: "" },
    { a: equityAmounts.a10, b: equityAmounts.a25 },
    { a: equityAmounts.a25, b: equityAmounts.a40 },
    { a: equityAmounts.a40, b: "" },
  ];
  const equityOptions = EQUITY_MID_PCTS.map((pct, i) => ({
    value: Math.round((profile.propertyPrice * pct) / 10_000) * 10_000,
    label: t.wizard.equityOptions[i],
    sub: fmt(t.wizard.equitySubs[i], equitySubVars[i]),
  }));

  return (
    <WizardShell stepIndex={stepIndex} total={steps.length} onBack={stepIndex > 0 ? goBack : undefined}>
      {currentStep === "category" && (
        <ChoiceStep
          eyebrow={t.wizard.eyebrowStart}
          question={t.wizard.qCategory}
          options={CATEGORY_VALUES.map((v) => ({
            value: v,
            label: t.wizard.categoryOptions[v].label,
            sub: t.wizard.categoryOptions[v].sub,
          }))}
          onAdvance={(v) => {
            trackStep("category", { buyerCategory: v });
            setProfile({ ...profile, buyerCategory: v });
            goNext();
          }}
        />
      )}
      {currentStep === "price" && (
        <RangeExactStep
          eyebrow={t.wizard.eyebrowPrice}
          question={t.wizard.qPrice}
          fieldLabel={t.wizard.qPrice}
          options={PRICE_VALUES.map((v, i) => ({ value: v, label: t.wizard.priceOptions[i] }))}
          min={200_000}
          max={15_000_000}
          step={10_000}
          onContinue={(v) => {
            trackStep("price");
            setProfile({ ...profile, propertyPrice: v });
            goNext();
          }}
        />
      )}
      {currentStep === "equity" && (
        <RangeExactStep
          eyebrow={t.wizard.eyebrowEquity}
          question={t.wizard.qEquity}
          subtitle={fmt(t.wizard.equitySubtitle, { price: formatCurrency(profile.propertyPrice) })}
          fieldLabel={t.wizard.qEquity}
          options={equityOptions}
          min={0}
          max={profile.propertyPrice}
          step={10_000}
          onContinue={(v) => {
            trackStep("equity");
            setProfile({ ...profile, ownEquity: v });
            goNext();
          }}
        />
      )}
      {currentStep === "income" && (
        <RangeExactStep
          eyebrow={t.wizard.eyebrowIncome}
          question={t.wizard.qIncome}
          fieldLabel={t.wizard.qIncome}
          options={INCOME_VALUES.map((v, i) => ({ value: v, label: t.wizard.incomeOptions[i] }))}
          min={0}
          max={200_000}
          step={500}
          onContinue={(v) => {
            trackStep("income");
            setProfile({ ...profile, monthlyNetIncome: v });
            goNext();
          }}
        />
      )}
      {currentStep === "debt" && (
        <RangeExactStep
          eyebrow={t.wizard.eyebrowDebt}
          question={t.wizard.qDebt}
          subtitle={t.wizard.debtSub}
          fieldLabel={t.wizard.qDebt}
          options={DEBT_VALUES.map((v, i) => ({
            value: v,
            label: t.wizard.debtOptions[i],
            skipExact: v === 0,
          }))}
          min={0}
          max={100_000}
          step={100}
          onContinue={(v) => {
            trackStep("debt", { hasDebt: v > 0 });
            setProfile({ ...profile, existingMonthlyDebt: v });
            goNext();
          }}
        />
      )}
      {currentStep === "age" && (
        <SliderExactStep
          eyebrow={t.wizard.eyebrowAge}
          question={t.wizard.qAge}
          subtitle={t.wizard.qAgeSub}
          value={profile.olderBorrowerAge}
          min={AGE_MIN}
          max={AGE_MAX}
          unit={t.wizard.ageUnit}
          onContinue={(v) => {
            trackStep("age");
            setProfile({ ...profile, olderBorrowerAge: v });
            goNext();
          }}
        />
      )}
      {currentStep === "mix" && (
        <MixStep
          profile={profile}
          assumptions={assumptions}
          mix={mix}
          onChange={setMix}
          onComplete={onComplete}
        />
      )}
    </WizardShell>
  );
}
