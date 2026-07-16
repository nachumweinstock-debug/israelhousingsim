import { useMemo, useState, type ReactNode } from "react";
import type { Assumptions, BorrowerProfile, BuyerCategory, Mix } from "../types";
import { CurrencyField } from "./ui/CurrencyField";
import { NumberField } from "./ui/NumberField";
import { TrackMixBuilder } from "./TrackMixBuilder";
import { computeLoanAmount, computeLtv } from "../engine/validation";
import { computeMixResult } from "../engine/mix";
import { basketToMix } from "../engine/baskets";
import { RULE_SET } from "../engine/rules";
import { formatCurrency, formatPercent } from "../engine/format";
import { navySelectedShadow, softCardBorder, softCardGradient, softCardShadow } from "../styles/brand";

type StepId = "category" | "aliyah" | "property" | "finances" | "mix";

function getSteps(profile: BorrowerProfile): StepId[] {
  const steps: StepId[] = ["category"];
  if (profile.buyerCategory === "oleh_chadash") steps.push("aliyah");
  steps.push("property", "finances", "mix");
  return steps;
}

const CATEGORY_OPTIONS: Array<{ value: BuyerCategory; label: string; sub: string }> = [
  { value: "first_home", label: "First home", sub: "This will be my first place" },
  { value: "replacement_home", label: "Replacement home", sub: "I'm selling my current home to buy this one" },
  { value: "investment", label: "Investment / additional home", sub: "This is a second home or investment property" },
  { value: "foreign_resident", label: "Foreign resident", sub: "I live outside Israel" },
  { value: "oleh_chadash", label: "Oleh chadash", sub: "I'm a new immigrant" },
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

function CategoryStep({
  value,
  onAdvance,
}: {
  value: BuyerCategory;
  onAdvance: (v: BuyerCategory) => void;
}) {
  const [pending, setPending] = useState<BuyerCategory | null>(null);

  function select(v: BuyerCategory) {
    setPending(v);
    setTimeout(() => onAdvance(v), 200);
  }

  return (
    <div className="mb-reveal">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/40">
        Question 1 of 5
      </p>
      <h2 className="mb-8 font-serif text-3xl leading-tight text-navy sm:text-4xl">
        What kind of buyer are you?
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CATEGORY_OPTIONS.map((opt) => {
          const selected = (pending ?? value) === opt.value && pending !== null;
          return (
            <button
              key={opt.value}
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
              <p className={`mt-0.5 text-xs ${selected ? "text-white/60" : "text-navy-mid/60"}`}>{opt.sub}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AliyahStep({
  years,
  onChange,
  onContinue,
}: {
  years: number;
  onChange: (v: number) => void;
  onContinue: () => void;
}) {
  return (
    <div className="mb-reveal">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/40">
        Question 2 of 5
      </p>
      <h2 className="mb-8 font-serif text-3xl leading-tight text-navy sm:text-4xl">
        How many years since you made aliyah?
      </h2>
      <NumberField label="Years since aliyah" value={years} onChange={onChange} unit="yrs" min={0} max={30} />
      <ContinueButton onClick={onContinue} />
    </div>
  );
}

function PropertyStep({
  profile,
  onChange,
  onContinue,
}: {
  profile: BorrowerProfile;
  onChange: (p: BorrowerProfile) => void;
  onContinue: () => void;
}) {
  const loanAmount = computeLoanAmount(profile);
  const ltv = computeLtv(profile);
  return (
    <div className="mb-reveal">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/40">
        Property &amp; equity
      </p>
      <h2 className="mb-8 font-serif text-3xl leading-tight text-navy sm:text-4xl">
        What's the property price, and how much equity do you have?
      </h2>
      <div className="space-y-5">
        <CurrencyField
          label="Property price"
          labelHe="מחיר הנכס"
          value={profile.propertyPrice}
          onChange={(v) => onChange({ ...profile, propertyPrice: v })}
          min={200_000}
          max={10_000_000}
          step={10_000}
        />
        <CurrencyField
          label="Own equity"
          labelHe="הון עצמי"
          value={profile.ownEquity}
          onChange={(v) => onChange({ ...profile, ownEquity: v })}
          min={0}
          max={profile.propertyPrice || 10_000_000}
          step={10_000}
        />
      </div>
      <div
        className="mt-5 rounded-2xl p-4 text-center"
        style={{ background: softCardGradient, border: softCardBorder, boxShadow: softCardShadow }}
      >
        <span className="text-sm text-navy-mid/70">Loan amount </span>
        <span className="font-serif text-lg text-navy">{formatCurrency(loanAmount)}</span>
        <span className="text-sm text-navy-mid/70"> · LTV </span>
        <span className="font-serif text-lg text-navy">{formatPercent(ltv)}</span>
      </div>
      <ContinueButton onClick={onContinue} />
    </div>
  );
}

function FinancesStep({
  profile,
  onChange,
  onContinue,
}: {
  profile: BorrowerProfile;
  onChange: (p: BorrowerProfile) => void;
  onContinue: () => void;
}) {
  const comfortablePayment = profile.monthlyNetIncome / 3;
  return (
    <div className="mb-reveal">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/40">
        Your finances
      </p>
      <h2 className="mb-8 font-serif text-3xl leading-tight text-navy sm:text-4xl">
        Tell us about your income and existing commitments.
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <CurrencyField
          label="Combined monthly net income"
          labelHe="הכנסה נטו חודשית"
          value={profile.monthlyNetIncome}
          onChange={(v) => onChange({ ...profile, monthlyNetIncome: v })}
          min={0}
          max={100_000}
          step={500}
        />
        <CurrencyField
          label="Existing monthly debt"
          labelHe="החזר חודשי קיים"
          value={profile.existingMonthlyDebt}
          onChange={(v) => onChange({ ...profile, existingMonthlyDebt: v })}
          min={0}
          max={50_000}
          step={100}
        />
        <NumberField
          label="Age of older borrower"
          value={profile.olderBorrowerAge}
          onChange={(v) => onChange({ ...profile, olderBorrowerAge: v })}
          unit="yrs"
          min={18}
          max={90}
        />
        <NumberField
          label="Requested term"
          labelHe="תקופת ההלוואה"
          value={profile.requestedTermYears}
          onChange={(v) => onChange({ ...profile, requestedTermYears: v })}
          unit="yrs"
          min={1}
          max={30}
        />
      </div>
      {profile.monthlyNetIncome > 0 && (
        <p className="mt-4 text-xs text-navy-mid/55">
          Lenders typically want your total mortgage payment under ~33% of net income — for you,
          that's roughly {formatCurrency(comfortablePayment)}/mo.
        </p>
      )}
      <ContinueButton onClick={onContinue} />
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

  function useRecommended() {
    onChange(recommended);
    onComplete();
  }

  return (
    <div className="mb-reveal">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-navy/40">
        Your track mix
      </p>
      <h2 className="mb-6 font-serif text-3xl leading-tight text-navy sm:text-4xl">
        Ready to build your mix?
      </h2>

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
          <ContinueButton onClick={onComplete} label="Finish setup — see my results →" />
        </>
      )}
    </div>
  );
}

function ContinueButton({ onClick, label }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="mt-6 w-full rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-cream transition-all duration-200 active:scale-[0.98] sm:w-auto"
      style={{ boxShadow: navySelectedShadow }}
    >
      {label ?? "Continue →"}
    </button>
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
        <CategoryStep
          value={profile.buyerCategory}
          onAdvance={(v) => {
            setProfile({ ...profile, buyerCategory: v });
            goNext();
          }}
        />
      )}
      {currentStep === "aliyah" && (
        <AliyahStep
          years={profile.yearsSinceAliyah ?? 0}
          onChange={(v) => setProfile({ ...profile, yearsSinceAliyah: v })}
          onContinue={goNext}
        />
      )}
      {currentStep === "property" && (
        <PropertyStep profile={profile} onChange={setProfile} onContinue={goNext} />
      )}
      {currentStep === "finances" && (
        <FinancesStep profile={profile} onChange={setProfile} onContinue={goNext} />
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
