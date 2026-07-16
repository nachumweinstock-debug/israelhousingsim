import { useMemo, useState, type ReactNode } from "react";
import type { Assumptions, BorrowerProfile, BuyerCategory, Mix } from "../types";
import { TrackMixBuilder } from "./TrackMixBuilder";
import { computeLoanAmount, computeLtv } from "../engine/validation";
import { computeMixResult } from "../engine/mix";
import { basketToMix } from "../engine/baskets";
import { RULE_SET } from "../engine/rules";
import { formatCurrency, formatPercent } from "../engine/format";
import { navySelectedShadow, softCardBorder, softCardGradient, softCardShadow } from "../styles/brand";

type StepId = "category" | "aliyah" | "price" | "equity" | "income" | "debt" | "mix";

function getSteps(profile: BorrowerProfile): StepId[] {
  const steps: StepId[] = ["category"];
  if (profile.buyerCategory === "oleh_chadash") steps.push("aliyah");
  steps.push("price", "equity", "income", "debt", "mix");
  return steps;
}

const CATEGORY_OPTIONS: Array<{ value: BuyerCategory; label: string; sub: string }> = [
  { value: "first_home", label: "First home", sub: "This will be my first place" },
  { value: "replacement_home", label: "Replacement home", sub: "I'm selling my current home to buy this one" },
  { value: "investment", label: "Investment / additional home", sub: "This is a second home or investment property" },
  { value: "foreign_resident", label: "Foreign resident", sub: "I live outside Israel" },
  { value: "oleh_chadash", label: "Oleh chadash", sub: "I'm a new immigrant" },
];

const ALIYAH_OPTIONS = [
  { value: 1, label: "0–2 years ago" },
  { value: 4, label: "3–5 years ago" },
  { value: 8, label: "6–10 years ago" },
  { value: 15, label: "More than 10 years ago" },
];

const PRICE_OPTIONS = [
  { value: 1_300_000, label: "Under ₪1.5M" },
  { value: 1_750_000, label: "₪1.5M – 2M" },
  { value: 2_250_000, label: "₪2M – 2.5M" },
  { value: 3_000_000, label: "₪2.5M – 3.5M" },
  { value: 4_000_000, label: "₪3.5M+" },
];

const EQUITY_PCT_OPTIONS = [
  { value: 0.08, label: "Less than 10%" },
  { value: 0.18, label: "10% – 25%" },
  { value: 0.32, label: "25% – 40%" },
  { value: 0.5, label: "40% or more" },
];

const INCOME_OPTIONS = [
  { value: 8_000, label: "Under ₪10k/mo" },
  { value: 12_500, label: "₪10k – 15k/mo" },
  { value: 17_500, label: "₪15k – 20k/mo" },
  { value: 25_000, label: "₪20k – 30k/mo" },
  { value: 35_000, label: "₪30k+/mo" },
];

const DEBT_OPTIONS = [
  { value: 0, label: "None" },
  { value: 500, label: "Under ₪1k/mo" },
  { value: 2_000, label: "₪1k – 3k/mo" },
  { value: 4_000, label: "₪3k – 5k/mo" },
  { value: 6_000, label: "₪5k+/mo" },
];

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
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <ProgressDots total={total} current={stepIndex} />
        <span className="w-10 text-right text-xs text-navy-mid/40">
          {stepIndex + 1}/{total}
        </span>
      </div>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-10">{children}</div>
    </div>
  );
}

/**
 * Shared "one big tappable answer at a time" question — the Kahoot-style
 * pattern this whole wizard is built around. Selecting an option shows a
 * brief selected state, then auto-advances (no separate Continue tap
 * needed), matching vryfid-demo's quiz flow.
 */
function ChoiceStep<T>({
  eyebrow,
  question,
  subtitle,
  options,
  onAdvance,
  columns = 2,
}: {
  eyebrow: string;
  question: string;
  subtitle?: string;
  options: Array<{ value: T; label: string; sub?: string }>;
  onAdvance: (v: T) => void;
  columns?: 1 | 2;
}) {
  const [pending, setPending] = useState<T | null>(null);

  function select(v: T) {
    setPending(v);
    setTimeout(() => onAdvance(v), 200);
  }

  return (
    <div className="mb-reveal">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/40">{eyebrow}</p>
      <h2 className="mb-2 font-serif text-3xl leading-tight text-navy sm:text-4xl">{question}</h2>
      {subtitle && <p className="mb-6 text-sm text-navy-mid/60">{subtitle}</p>}
      {!subtitle && <div className="mb-8" />}
      <div className={`grid grid-cols-1 gap-3 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
        {options.map((opt, i) => {
          const selected = pending !== null && pending === opt.value;
          return (
            <button
              key={i}
              onClick={() => select(opt.value)}
              className={`rounded-2xl border-2 px-5 py-4 text-left transition-all duration-200 active:scale-[0.98] ${
                selected
                  ? "border-navy bg-navy"
                  : "border-warm-border bg-white hover:border-navy hover:shadow-md"
              }`}
              style={selected ? { boxShadow: navySelectedShadow } : { boxShadow: softCardShadow }}
            >
              <p className={`text-sm font-semibold leading-snug ${selected ? "text-white" : "text-navy"}`}>
                {opt.label}
              </p>
              {opt.sub && (
                <p className={`mt-0.5 text-xs ${selected ? "text-white/60" : "text-navy-mid/60"}`}>{opt.sub}</p>
              )}
            </button>
          );
        })}
      </div>
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
        Your track mix
      </p>
      <h2 className="mb-2 font-serif text-3xl leading-tight text-navy sm:text-4xl">
        Ready to build your mix?
      </h2>
      <p className="mb-6 text-sm text-navy-mid/60">
        Loan amount {formatCurrency(loanAmount)} · LTV {formatPercent(ltv)}
      </p>

      {!customizing && (
        <>
          <div
            className="rounded-2xl p-5"
            style={{ background: softCardGradient, border: softCardBorder, boxShadow: softCardShadow }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy/45">
              Recommended starting mix — Basket 2
            </p>
            <p className="mt-1 text-sm text-navy-mid/70">
              One third fixed unindexed, one third variable CPI-indexed, one third prime — a
              balanced, widely-used mix.
            </p>
            <div className="mt-4 flex gap-6">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-navy/40">Payment today</div>
                <div className="font-serif text-xl text-navy">
                  {formatCurrency(recommendedResult.paymentToday)}/mo
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-navy/40">Highest expected</div>
                <div className="font-serif text-xl text-navy">
                  {formatCurrency(recommendedResult.paymentStressed)}/mo
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={useRecommended}
            className="mt-5 w-full rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-cream transition-all duration-200 active:scale-[0.98]"
            style={{ boxShadow: navySelectedShadow }}
          >
            Use this mix — see my results →
          </button>
          <button
            onClick={() => setCustomizing(true)}
            className="mt-3 w-full rounded-full border border-warm-border bg-white px-6 py-3 text-sm font-semibold text-navy-mid/70 transition-colors hover:border-navy hover:text-navy"
          >
            Customize manually
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
            Finish setup — see my results →
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
  const steps = getSteps(profile);
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }
  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  return (
    <WizardShell stepIndex={stepIndex} total={steps.length} onBack={stepIndex > 0 ? goBack : undefined}>
      {currentStep === "category" && (
        <ChoiceStep
          eyebrow="Let's start with you"
          question="What kind of buyer are you?"
          options={CATEGORY_OPTIONS}
          onAdvance={(v) => {
            setProfile({ ...profile, buyerCategory: v });
            goNext();
          }}
        />
      )}
      {currentStep === "aliyah" && (
        <ChoiceStep
          eyebrow="A bit more about you"
          question="How long ago did you make aliyah?"
          options={ALIYAH_OPTIONS}
          onAdvance={(v) => {
            setProfile({ ...profile, yearsSinceAliyah: v });
            goNext();
          }}
        />
      )}
      {currentStep === "price" && (
        <ChoiceStep
          eyebrow="The property"
          question="What's the property price?"
          options={PRICE_OPTIONS}
          onAdvance={(v) => {
            setProfile({ ...profile, propertyPrice: v });
            goNext();
          }}
        />
      )}
      {currentStep === "equity" && (
        <ChoiceStep
          eyebrow="Your equity"
          question="How much of that do you already have in cash?"
          subtitle={`As a share of the ${formatCurrency(profile.propertyPrice)} price you picked`}
          options={EQUITY_PCT_OPTIONS}
          onAdvance={(pct) => {
            setProfile({ ...profile, ownEquity: Math.round(profile.propertyPrice * pct) });
            goNext();
          }}
        />
      )}
      {currentStep === "income" && (
        <ChoiceStep
          eyebrow="Your finances"
          question="What's your combined monthly net income?"
          options={INCOME_OPTIONS}
          onAdvance={(v) => {
            setProfile({ ...profile, monthlyNetIncome: v });
            goNext();
          }}
        />
      )}
      {currentStep === "debt" && (
        <ChoiceStep
          eyebrow="Almost there"
          question="Any existing monthly debt?"
          subtitle="Car loans, other mortgages, or standing obligations — banks count this against you."
          options={DEBT_OPTIONS}
          onAdvance={(v) => {
            setProfile({ ...profile, existingMonthlyDebt: v });
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
