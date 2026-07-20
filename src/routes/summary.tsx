import { useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, animate, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { track } from "@vercel/analytics";
import { palette } from "../theme/palette.js";
import { FlowDirectionContext, shellVariants } from "../components/QuestionShell";
import { PrintPlan } from "../components/PrintPlan";
import type { PrintMode } from "../components/PrintPlan";
import {
  computeCosts,
  computePlan,
  formatPct,
  formatShekels,
  stressedMonthlyPayment,
} from "../lib/mortgageMath";
import type { TrackKey } from "../lib/mortgageMath";
import { fmt } from "../i18n";
import { loanAmountOf, useSimulatorStore } from "../state/simulatorStore";
import { useSimLang } from "../state/useSimLang";

const TRACK_BAR_CLASS: Record<TrackKey, string> = {
  prime: "bg-accent",
  kalatz: "bg-accentSoft",
  katz: "bg-accentMid",
};

/**
 * Bank sites block embedding, so the hand off is: download your plan,
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

  const loanAmount = loanAmountOf(state);
  const planInputs = {
    loanAmount,
    termYears: state.termYears,
    mix: state.mix,
    inflation: state.inflation,
  };
  const plan = computePlan(planInputs);
  const stress1 = stressedMonthlyPayment(planInputs, 1);
  const stress2 = stressedMonthlyPayment(planInputs, 2);
  const breakdown = computeCosts(
    state.propertyPrice,
    state.residency,
    state.buyerStatus,
    state.costs
  );
  const ltv = state.propertyPrice > 0 ? loanAmount / state.propertyPrice : 0;
  const cashToClose = state.downPayment + breakdown.total;

  // One anonymous capture per summary visit — the inputs and results are
  // the product signal this demo exists to collect.
  const capturedRef = useRef(false);
  useEffect(() => {
    if (capturedRef.current) return;
    capturedRef.current = true;
    track("simulation_completed", {
      price: state.propertyPrice,
      loan: loanAmount,
      payment: Math.round(plan.monthlyPayment),
      lang,
    });
    const payload = {
      lang,
      answers: {
        residency: state.residency,
        aliyahYears: state.residency === "oleh" ? state.aliyahYears : null,
        ownedPropertyBefore: state.residency === "oleh" ? state.ownedPropertyBefore : null,
        buyerStatus: state.buyerStatus,
        propertyPrice: state.propertyPrice,
        downPayment: state.downPayment,
        termYears: state.termYears,
        mix: state.mix,
        inflation: state.inflation,
        costs: state.costs,
      },
      results: {
        loanAmount,
        monthlyPayment: Math.round(plan.monthlyPayment),
        totalInterest: Math.round(plan.totalInterest),
        totalRepayment: Math.round(plan.totalRepayment),
        ltv: Math.round(ltv * 1000) / 1000,
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
                {s.summary.heroLabel}
              </p>
              <p className="mt-2 text-5xl font-bold text-ink sm:text-6xl">
                <CountUp value={plan.monthlyPayment} format={formatShekels} delay={0.15} />
              </p>
              <p className="mt-2 text-[14px] text-inkMuted">
                {fmt(s.summary.heroSub, { years: state.termYears })}
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
                    transition={{ delay: 0.5, type: "spring", stiffness: 120, damping: 24 }}
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
            </motion.div>

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
