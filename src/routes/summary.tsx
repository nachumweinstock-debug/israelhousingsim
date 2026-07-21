import { useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, animate, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { track } from "@vercel/analytics";
import { palette } from "../theme/palette.js";
import { FlowDirectionContext, InfoNote, shellVariants } from "../components/QuestionShell";
import { PrintPlan } from "../components/PrintPlan";
import type { PrintMode } from "../components/PrintPlan";
import { formatPct, formatShekels } from "../lib/mortgageMath";
import type { TrackKey } from "../lib/mortgageMath";
import { buildReportModel } from "../lib/reportModel";
import { buildInvestorReportModel } from "../lib/investorReportModel";
import { fmt } from "../i18n";
import { useSimulatorStore } from "../state/simulatorStore";
import { useSimLang } from "../state/useSimLang";

const TRACK_BAR_CLASS: Record<TrackKey, string> = {
  prime: "bg-accent",
  kalatz: "bg-accentSoft",
  katz: "bg-accentMid",
};

/**
 * Bank sites block embedding, so the hand off is: download your report,
 * then open the bank's own pre approval flow in a new tab or call their
 * mortgage line. Plain outbound links, no affiliation.
 */
const BANKS = [
  {
    nameEn: "Bank Hapoalim",
    nameHe: "בנק הפועלים",
    mark: "P",
    color: "#D71920",
    url: "https://www.bankhapoalim.co.il",
    phone: "*2408",
  },
  {
    nameEn: "Bank Leumi",
    nameHe: "בנק לאומי",
    mark: "L",
    color: "#004B9B",
    url: "https://www.leumi.co.il",
    phone: "*3200",
  },
  {
    nameEn: "Mizrahi-Tefahot",
    nameHe: "מזרחי טפחות",
    mark: "M",
    color: "#F47B20",
    url: "https://www.mizrahi-tefahot.co.il",
    phone: "*8860",
  },
  {
    nameEn: "Discount Bank",
    nameHe: "בנק דיסקונט",
    mark: "D",
    color: "#009B77",
    url: "https://www.discountbank.co.il",
    phone: "*2009",
  },
];

/** Animated count up numeral for the reveal moment. */
function CountUp({
  value,
  format,
  duration = 1.1,
  delay = 0,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  delay?: number;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: setDisplay,
    });
    return () => controls.stop();
  }, [value, duration, delay]);
  return (
    <span className="tabular-nums" dir="ltr">
      {format(display)}
    </span>
  );
}

const gridReveal = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const cardReveal = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.48, ease: EASE_OUT } },
};

const heroReveal = {
  hidden: { opacity: 0, y: 26, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
};

const CONFETTI_COLORS = [palette.accent, palette.accentSoft, palette.accentMid, palette.card];

/** One shot light blue confetti burst behind the hero payment card. */
function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 360,
        yEnd: 160 + Math.random() * 160,
        rotate: (Math.random() - 0.5) * 560,
        delay: 0.2 + Math.random() * 0.3,
        size: 6 + Math.random() * 7,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    []
  );
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-10 flex justify-center"
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          className="absolute rounded-[3px]"
          style={{
            width: piece.size,
            height: piece.size * 0.6,
            backgroundColor: piece.color,
            boxShadow: "0 0 0 1px rgba(42, 42, 40, 0.03)",
          }}
          initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: [0, 1, 1, 0], x: piece.x, y: piece.yEnd, rotate: piece.rotate }}
          transition={{
            duration: 1.5,
            delay: piece.delay,
            ease: "easeOut",
            y: { duration: 1.5, delay: piece.delay, ease: "easeIn" },
          }}
        />
      ))}
    </div>
  );
}

function MetricCard({
  label,
  children,
  sub,
}: {
  label: string;
  children: ReactNode;
  sub?: string;
}) {
  return (
    <motion.div
      variants={cardReveal}
      className="rounded-3xl border border-accentSoft bg-accentSoft/25 p-6"
    >
      <p className="text-[13px] font-semibold uppercase tracking-wide text-inkMuted">{label}</p>
      <p className="mt-1.5 text-[26px] font-bold text-ink">{children}</p>
      {sub ? <p className="mt-1 text-[12px] leading-snug text-inkMuted">{sub}</p> : null}
    </motion.div>
  );
}

function Crunching({ messages }: { messages: string[] }) {
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(
      () => setMsgIdx((i) => Math.min(i + 1, messages.length - 1)),
      650
    );
    return () => window.clearInterval(timer);
  }, [messages.length]);

  return (
    <motion.div
      key="crunching"
      exit={{ opacity: 0, scale: 0.97, filter: "blur(4px)" }}
      transition={{ duration: 0.3 }}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-8"
    >
      <div className="flex items-end gap-3" aria-hidden="true">
        {[44, 68, 92, 58, 78].map((height, i) => (
          <motion.div
            key={height}
            className="w-9 origin-bottom rounded-t-lg bg-accentSoft"
            style={{ height }}
            animate={{ scaleY: [0.7, 1, 0.7], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={msgIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="text-lg font-medium text-ink"
        >
          {messages[msgIdx]}
        </motion.p>
      </AnimatePresence>
      <div className="flex items-center gap-2">
        {messages.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-pill transition-all duration-300 ${
              i <= msgIdx ? "w-6 bg-accent" : "w-2 bg-hairline"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function Summary() {
  const direction = useContext(FlowDirectionContext);
  const navigate = useNavigate();
  const state = useSimulatorStore();
  const { s, lang, isHe } = useSimLang();
  const [phase, setPhase] = useState<"crunching" | "ready">("crunching");
  const [printMode, setPrintMode] = useState<PrintMode>("both");

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase("ready"), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  function downloadPdf(mode: PrintMode) {
    track("pdf_download_started", { mode });
    setPrintMode(mode);
    window.setTimeout(() => window.print(), 60);
  }

  const model = buildReportModel(state, s);
  const {
    loanAmount,
    plan,
    stress1,
    stress2,
    ltv,
    cashToClose,
    horizonYear,
    paymentAtHorizon,
    dti,
    showsBridgeCaution,
    checks,
    hasFailure,
    failingChecks,
    stillNeedsLines,
    creditNotes,
  } = model;

  const investorModel = buildInvestorReportModel(
    state,
    { loanAmount, termYears: state.termYears, mix: state.mix, inflation: state.inflation },
    plan.monthlyPayment,
    cashToClose
  );

  // One anonymous capture per summary visit, the inputs and computed
  // results are the product signal this demo exists to collect. No name
  // or identifying number is ever collected anywhere in this flow.
  const capturedRef = useRef(false);
  useEffect(() => {
    if (capturedRef.current) return;
    capturedRef.current = true;
    track("simulation_completed", {
      price: state.propertyPrice,
      loan: loanAmount,
      payment: Math.round(plan.monthlyPayment),
      dti: Math.round(dti * 1000) / 1000,
      lang,
    });
    const payload = {
      lang,
      answers: {
        residency: state.residency,
        aliyahYears: state.residency === "oleh" ? state.aliyahYears : null,
        ownedPropertyBefore: state.residency === "oleh" ? state.ownedPropertyBefore : null,
        buyerStatus: state.buyerStatus,
        existingHomeStatus: state.existingHomeStatus,
        income: {
          applicantIncome: state.income.applicantIncome,
          hasCoApplicant: state.income.hasCoApplicant,
          coApplicantIncome: state.income.coApplicantIncome,
          employmentType: state.income.employmentType,
          employerTenureYears: state.income.employerTenureYears,
          existingMonthlyDebt: state.income.existingMonthlyDebt,
        },
        propertyPrice: state.propertyPrice,
        downPayment: state.downPayment,
        downPaymentSource: state.downPaymentSource,
        termYears: state.termYears,
        mix: state.mix,
        inflation: state.inflation,
        costs: state.costs,
        creditStanding: state.creditStanding,
      },
      results: {
        loanAmount,
        monthlyPayment: Math.round(plan.monthlyPayment),
        paymentAtHorizon: Math.round(paymentAtHorizon),
        horizonYear,
        totalInterest: Math.round(plan.totalInterest),
        totalRepayment: Math.round(plan.totalRepayment),
        ltv: Math.round(ltv * 1000) / 1000,
        dti: Math.round(dti * 1000) / 1000,
        cashToClose: Math.round(cashToClose),
        stressPlus1: Math.round(stress1),
        stressPlus2: Math.round(stress2),
      },
    };
    fetch("/api/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Capture must never affect the user-facing flow.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.section
      custom={direction}
      variants={shellVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="mx-auto w-full max-w-2xl px-6 pb-24 pt-8 sm:pt-12"
    >
      <PrintPlan answers={state} mode={printMode} />
      <AnimatePresence mode="wait">
        {phase === "crunching" ? (
          <Crunching messages={s.summary.crunch} />
        ) : (
          <motion.div
            key="ready"
            variants={gridReveal}
            initial="hidden"
            animate="show"
            className="relative"
          >
            <ConfettiBurst />
            <motion.h1
              variants={cardReveal}
              className="text-center text-[28px] font-semibold leading-[1.25] tracking-tight text-ink sm:text-[32px]"
            >
              {s.summary.title}
            </motion.h1>

            <motion.div
              variants={heroReveal}
              className="relative mt-7 overflow-hidden rounded-3xl border border-accentSoft bg-accentSoft/35 p-7 text-center shadow-lift"
            >
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)",
                  backgroundSize: "250% 100%",
                }}
                initial={{ backgroundPosition: "250% 0" }}
                animate={{ backgroundPosition: "-250% 0" }}
                transition={{ duration: 1.6, delay: 0.7, ease: "easeInOut" }}
              />
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-inkMuted">
                {s.report.paymentTodayLabel}
              </p>
              <p className="mt-2 text-5xl font-bold text-ink sm:text-6xl">
                <CountUp value={plan.monthlyPayment} format={formatShekels} delay={0.15} />
              </p>
              <p className="mt-2 text-[14px] text-inkMuted">
                {fmt(s.summary.heroSub, { years: state.termYears })}
              </p>

              <div className="mt-5 flex items-center justify-center gap-2 border-t border-accentSoft/60 pt-4">
                <p className="text-[13px] font-semibold text-inkMuted">
                  {fmt(s.report.paymentYearLabel, { year: horizonYear })}
                </p>
                <p className="text-[15px] font-bold text-ink" dir="ltr">
                  {formatShekels(paymentAtHorizon)}
                </p>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-inkMuted">
                {s.report.paymentGrowNote}
              </p>
            </motion.div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <MetricCard label={s.summary.totalInterest}>
                <CountUp value={plan.totalInterest} format={formatShekels} delay={0.3} />
              </MetricCard>
              <MetricCard label={s.summary.totalRepayment}>
                <CountUp value={plan.totalRepayment} format={formatShekels} delay={0.4} />
              </MetricCard>
              <MetricCard
                label={s.summary.ltv}
                sub={fmt(s.summary.ltvSub, { price: formatShekels(state.propertyPrice) })}
              >
                <span dir="ltr">{formatPct(ltv)}</span>
              </MetricCard>
              <MetricCard label={s.summary.cashToClose} sub={s.summary.cashSub}>
                <CountUp value={cashToClose} format={formatShekels} delay={0.5} />
              </MetricCard>
            </div>

            {hasFailure ? (
              <motion.div
                variants={cardReveal}
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(197, 48, 48, 0.35)",
                    "0 0 0 10px rgba(197, 48, 48, 0)",
                  ],
                }}
                transition={{ boxShadow: { duration: 1.8, repeat: Infinity, ease: "easeOut" } }}
                className="relative mt-5 overflow-hidden rounded-3xl border-2 border-bad bg-bad/10 p-6"
              >
                <div className="flex items-start gap-3">
                  <motion.span
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-bad text-lg font-bold text-white"
                    aria-hidden="true"
                  >
                    !
                  </motion.span>
                  <div className="min-w-0">
                    <p className="text-[16px] font-bold text-bad">{s.report.bannerHeading}</p>
                    <ul className="mt-2 space-y-1.5">
                      {failingChecks.map((c) => (
                        <li key={c.id} className="text-[14px] leading-relaxed text-ink/85">
                          {c.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ) : null}

            <motion.div
              variants={cardReveal}
              className="mt-5 rounded-3xl border border-hairline bg-card p-6 shadow-lift"
            >
              <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-inkMuted">
                {s.summary.mixTitle}
              </p>
              <div className="flex h-3 w-full overflow-hidden rounded-pill border border-hairline">
                {(Object.keys(TRACK_BAR_CLASS) as TrackKey[]).map((key) => (
                  <motion.div
                    key={key}
                    className={TRACK_BAR_CLASS[key]}
                    initial={{ width: 0 }}
                    animate={{ width: `${state.mix[key]}%` }}
                    transition={{ delay: 0.5, duration: 0.5, ease: EASE_OUT }}
                  />
                ))}
              </div>
              <div className="mt-3 grid gap-1.5 sm:grid-cols-3">
                {plan.perTrack.map((item) => (
                  <div key={item.track} className="flex items-center gap-2 text-[13px] text-inkMuted">
                    <span
                      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-pill ${TRACK_BAR_CLASS[item.track]}`}
                      aria-hidden="true"
                    />
                    <span>
                      <span className="font-semibold text-ink">
                        {s.tracks[item.track].name} {item.percent}%
                      </span>{" "}
                      · <span dir="ltr">{formatShekels(item.monthlyPayment)}</span>
                      {s.summary.perMonth}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={cardReveal}
              className="mt-5 rounded-3xl border border-hairline bg-card p-6 shadow-lift"
            >
              <p className="text-[13px] font-semibold uppercase tracking-wide text-inkMuted">
                {s.summary.stressTitle}
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink">
                {s.summary.stressUp1}{" "}
                <span className="font-bold tabular-nums" dir="ltr">
                  {formatShekels(stress1)}
                </span>
                <span className="text-inkMuted" dir="ltr">
                  {" "}
                  (+{formatShekels(stress1 - plan.monthlyPayment)})
                </span>
                <br />
                {s.summary.stressUp2}{" "}
                <span className="font-bold tabular-nums" dir="ltr">
                  {formatShekels(stress2)}
                </span>
                <span className="text-inkMuted" dir="ltr">
                  {" "}
                  (+{formatShekels(stress2 - plan.monthlyPayment)})
                </span>
              </p>
              <p className="mt-3 border-t border-hairline pt-3 text-[12px] leading-relaxed text-inkMuted">
                {s.report.rateNoteUnderTable}
              </p>
            </motion.div>

            {investorModel ? (
              <motion.div
                variants={cardReveal}
                className="mt-5 rounded-3xl border border-hairline bg-card p-6 shadow-lift"
              >
                <p className="text-[13px] font-semibold uppercase tracking-wide text-inkMuted">
                  {s.investorReport.sectionTitle}
                </p>

                <div
                  className={`mt-3 rounded-2xl border p-5 ${
                    investorModel.netMonthlyCashFlow >= 0
                      ? "border-good/30 bg-good/10"
                      : "border-warn/30 bg-warn/10"
                  }`}
                >
                  {/* Color alone shouldn't carry the pass/fail signal (fails
                      for colorblind users): the +/- sign and the differing
                      note sentence already say it in words, and this icon
                      adds a third, language-independent cue at a glance,
                      matching the ✓/✕/! icons the checks list already uses
                      for the same reason. */}
                  <p className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wide text-inkMuted">
                    <span
                      aria-hidden="true"
                      className={`text-[15px] ${investorModel.netMonthlyCashFlow >= 0 ? "text-good" : "text-warn"}`}
                    >
                      {investorModel.netMonthlyCashFlow >= 0 ? "▲" : "▼"}
                    </span>
                    {s.investorReport.cashFlowLabel}
                  </p>
                  <p
                    className={`mt-1.5 text-[28px] font-bold tabular-nums ${
                      investorModel.netMonthlyCashFlow >= 0 ? "text-good" : "text-warn"
                    }`}
                    dir="ltr"
                  >
                    {investorModel.netMonthlyCashFlow >= 0 ? "+" : ""}
                    {formatShekels(investorModel.netMonthlyCashFlow)}
                    {s.summary.perMonth}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-inkMuted">
                    {investorModel.netMonthlyCashFlow >= 0
                      ? s.investorReport.cashFlowPositiveNote
                      : s.investorReport.cashFlowNegativeNote}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-hairline bg-cream p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-inkMuted">
                      {s.investorReport.grossYieldLabel}
                    </p>
                    <p className="mt-1 text-[20px] font-bold text-ink" dir="ltr">
                      {formatPct(investorModel.grossAnnualYieldPct, 1)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-hairline bg-cream p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-inkMuted">
                      {s.investorReport.netYieldLabel}
                    </p>
                    <p className="mt-1 text-[20px] font-bold text-ink" dir="ltr">
                      {formatPct(investorModel.netAnnualYieldPct, 1)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-hairline bg-cream p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-inkMuted">
                      {s.investorReport.cashOnCashLabel}
                    </p>
                    <p className="mt-1 text-[20px] font-bold text-ink" dir="ltr">
                      {formatPct(investorModel.cashOnCashReturnPct, 1)}
                    </p>
                    <p className="mt-1 text-[11px] leading-snug text-inkMuted">
                      {s.investorReport.cashOnCashNote}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-hairline bg-cream p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-inkMuted">
                      {s.investorReport.breakEvenRentLabel}
                    </p>
                    <p className="mt-1 text-[20px] font-bold text-ink" dir="ltr">
                      {formatShekels(investorModel.breakEvenRent)}
                      {s.summary.perMonth}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-hairline bg-cream p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 flex-1 text-[12px] font-semibold uppercase tracking-wide text-inkMuted">
                      {s.investorReport.dscrLabel}
                    </p>
                    <p className="shrink-0 whitespace-nowrap text-[18px] font-bold text-ink" dir="ltr">
                      {investorModel.dscr.toFixed(2)}
                    </p>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-inkMuted">
                    {s.investorReport.dscrNote}
                  </p>
                </div>

                <div className="mt-4 rounded-2xl border border-accentSoft bg-accentSoft/25 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 flex-1 text-[12px] font-semibold uppercase tracking-wide text-inkMuted">
                      {s.investorReport.totalCashNeededLabel}
                    </p>
                    <p className="shrink-0 whitespace-nowrap text-[18px] font-bold text-ink" dir="ltr">
                      {formatShekels(investorModel.totalCashNeeded)}
                    </p>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-inkMuted">
                    {s.investorReport.totalCashNeededSub}
                  </p>
                </div>

                <div className="mt-4 border-t border-hairline pt-4">
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-inkMuted">
                    {s.investorReport.recurringCostsTitle}
                  </p>
                  {/* Before: each <span> label had no min-w-0, so on a
                      narrow viewport the flex item's implicit min-width:auto
                      refused to shrink below its own unwrapped text width
                      (e.g. the maintenance label, long in both languages),
                      overflowing the row instead of wrapping. After: the
                      label takes the flexible remaining space and is allowed
                      to shrink and wrap; the value stays a fixed-width,
                      non-wrapping sibling since it's always short. */}
                  <ul className="space-y-1.5 text-[13px] text-inkMuted">
                    <li className="flex items-start justify-between gap-3">
                      <span className="min-w-0 flex-1">{s.investor.insuranceLabel}</span>
                      <span className="shrink-0 whitespace-nowrap" dir="ltr">
                        {formatShekels(investorModel.buildingInsuranceMonthly)}
                        {s.summary.perMonth}
                      </span>
                    </li>
                    {state.investor.useManagementCompany ? (
                      <li className="flex items-start justify-between gap-3">
                        <span className="min-w-0 flex-1">{s.investor.managementFeeLabel}</span>
                        <span className="shrink-0 whitespace-nowrap" dir="ltr">
                          {formatShekels(investorModel.managementFeeMonthly)}
                          {s.summary.perMonth}
                        </span>
                      </li>
                    ) : null}
                    <li className="flex items-start justify-between gap-3">
                      <span className="min-w-0 flex-1">{s.investor.maintenanceLabel}</span>
                      <span className="shrink-0 whitespace-nowrap" dir="ltr">
                        {formatShekels(investorModel.maintenanceMonthly)}
                        {s.summary.perMonth}
                      </span>
                    </li>
                    {state.investor.vacancyMonths > 0 ? (
                      <li className="flex items-start justify-between gap-3">
                        <span className="min-w-0 flex-1">{s.investorReport.vacancyLossLabel}</span>
                        <span className="shrink-0 whitespace-nowrap" dir="ltr">
                          -{formatShekels(investorModel.vacancyLossMonthly)}
                          {s.summary.perMonth}
                        </span>
                      </li>
                    ) : null}
                  </ul>
                </div>

                <div className="mt-4 border-t border-hairline pt-4">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-inkMuted">
                    {s.investorReport.rateSensitivityTitle}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {investorModel.rateSensitivity.map((point) => (
                      <div
                        key={point.shockPoints}
                        className={`rounded-xl border p-3 text-center ${
                          point.shockPoints === 0
                            ? "border-accent bg-accentSoft/25"
                            : "border-hairline bg-cream"
                        }`}
                      >
                        <p className="text-[11px] font-semibold text-inkMuted">
                          {point.shockPoints === -1
                            ? s.investorReport.rateLower
                            : point.shockPoints === 1
                              ? s.investorReport.rateHigher
                              : s.investorReport.rateEntered}
                        </p>
                        <p className="mt-1 text-[15px] font-bold tabular-nums text-ink" dir="ltr">
                          {formatShekels(point.monthlyPayment)}
                        </p>
                        <p
                          className={`mt-0.5 text-[11px] font-semibold tabular-nums ${
                            point.netMonthlyCashFlow >= 0 ? "text-good" : "text-warn"
                          }`}
                          dir="ltr"
                        >
                          {point.netMonthlyCashFlow >= 0 ? "+" : ""}
                          {formatShekels(point.netMonthlyCashFlow)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[12px] leading-relaxed text-inkMuted">
                    {s.investorReport.rateSensitivityNote}
                  </p>
                </div>
              </motion.div>
            ) : null}

            {showsBridgeCaution ? (
              <motion.div variants={cardReveal} className="mt-5">
                <InfoNote>{s.report.bridgeCaution}</InfoNote>
              </motion.div>
            ) : null}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <motion.div
                variants={cardReveal}
                className={`rounded-3xl border p-6 ${
                  hasFailure ? "border-hairline bg-card" : "border-accent bg-accentSoft/20"
                }`}
              >
                <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-ink">
                  {s.report.confirmsTitle}
                </p>
                <ul className="space-y-2.5">
                  {checks.map((c) => (
                    <li
                      key={c.id}
                      className={`flex gap-2 text-[13px] leading-relaxed ${
                        c.status === "fail"
                          ? "font-semibold text-bad"
                          : c.status === "warn"
                            ? "font-semibold text-warn"
                            : "text-ink/85"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`shrink-0 font-bold ${
                          c.status === "fail"
                            ? "text-bad"
                            : c.status === "warn"
                              ? "text-warn"
                              : "text-accent"
                        }`}
                      >
                        {c.status === "fail" ? "✕" : c.status === "warn" ? "!" : "✓"}
                      </span>
                      {c.text}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                variants={cardReveal}
                className="rounded-3xl border border-hairline bg-card p-6"
              >
                <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-inkMuted">
                  {s.report.stillNeedsTitle}
                </p>
                <ul className="space-y-2.5">
                  {stillNeedsLines.map((line) => (
                    <li key={line} className="flex gap-2 text-[13px] leading-relaxed text-inkMuted">
                      <span aria-hidden="true" className="shrink-0">
                        •
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {creditNotes.length > 0 ? (
              <motion.div
                variants={cardReveal}
                className="mt-5 rounded-3xl border border-hairline bg-cream p-6"
              >
                <p className="mb-2 text-[13px] font-bold uppercase tracking-wide text-inkMuted">
                  {s.report.creditNotesTitle}
                </p>
                <ul className="space-y-1.5">
                  {creditNotes.map((line) => (
                    <li key={line} className="flex gap-2 text-[13px] leading-relaxed text-inkMuted">
                      <span aria-hidden="true" className="shrink-0">
                        •
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : null}

            <motion.div
              variants={cardReveal}
              className="mt-5 rounded-3xl border border-hairline bg-card p-6 shadow-lift"
            >
              <p className="text-[15px] font-bold text-ink">{s.exportPanel.title}</p>
              <p className="mt-1 text-[13px] text-inkMuted">{s.exportPanel.sub}</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => downloadPdf("he")}
                  className="rounded-pill bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accentDeep active:scale-[0.98]"
                >
                  {s.exportPanel.downloadHe}
                </button>
                <button
                  type="button"
                  onClick={() => downloadPdf("en")}
                  className="rounded-pill bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accentDeep active:scale-[0.98]"
                >
                  {s.exportPanel.downloadEn}
                </button>
                <button
                  type="button"
                  onClick={() => downloadPdf("both")}
                  className="rounded-pill border border-accent bg-card px-5 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accentSoft/30 active:scale-[0.98]"
                >
                  {s.exportPanel.downloadBoth}
                </button>
              </div>

              <div className="mt-6 border-t border-hairline pt-4">
                <p className="text-[15px] font-bold text-ink">{s.exportPanel.banksTitle}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-inkMuted">
                  {s.exportPanel.banksNote}
                </p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {BANKS.map((bank) => (
                    <div
                      key={bank.nameEn}
                      className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-cream px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                          style={{ backgroundColor: bank.color }}
                          aria-hidden="true"
                        >
                          {bank.mark}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink">
                            {isHe ? bank.nameHe : bank.nameEn}
                          </p>
                          <p className="text-xs text-inkMuted" dir="ltr">
                            {s.exportPanel.call} {bank.phone}
                          </p>
                        </div>
                      </div>
                      <a
                        href={bank.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => track("bank_link_clicked", { bank: bank.nameEn, lang })}
                        className="shrink-0 rounded-pill border border-hairline bg-card px-3 py-1.5 text-xs font-semibold text-inkMuted transition-colors hover:border-accent hover:text-accent"
                      >
                        {s.exportPanel.visit} ↗
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={cardReveal}
              className="mt-5 rounded-3xl border border-hairline bg-card p-6 shadow-lift"
            >
              <p className="text-[15px] font-bold text-ink">{s.nextSteps.title}</p>
              <ol className="mt-4 space-y-4">
                {s.nextSteps.steps.map((step, i) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-accent text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{step.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-inkMuted">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </motion.div>

            <motion.div variants={cardReveal} className="mt-7 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  state.reset();
                  navigate("/simulator/welcome");
                }}
                className="text-[14px] font-semibold text-accent hover:text-accentDeep"
              >
                {s.summary.startOver}
              </button>
            </motion.div>

            <motion.p
              variants={cardReveal}
              className="mt-6 text-center text-[12px] leading-relaxed text-inkMuted"
            >
              {s.summary.disclaimer}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
