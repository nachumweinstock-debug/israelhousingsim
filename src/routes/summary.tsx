import { useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { palette } from "../theme/palette.js";
import { AnimatePresence, animate, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FlowDirectionContext, shellVariants } from "../components/QuestionShell";
import {
  TRACK_INFO,
  computeCosts,
  computePlan,
  formatPct,
  formatShekels,
  stressedMonthlyPayment,
} from "../lib/mortgageMath";
import type { TrackKey } from "../lib/mortgageMath";
import { loanAmountOf, useSimulatorStore } from "../state/simulatorStore";

const CRUNCH_MESSAGES = [
  "Blending your track mix…",
  "Projecting the Madad…",
  "Stress testing Prime…",
];

const TRACK_BAR_CLASS: Record<TrackKey, string> = {
  prime: "bg-accent",
  kalatz: "bg-accentSoft",
  katz: "bg-accentMid",
};

/** Animated count-up numeral for the reveal moment. */
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
  return <span className="tabular-nums">{format(display)}</span>;
}

const gridReveal = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const cardReveal = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const heroReveal = {
  hidden: { opacity: 0, y: 34, scale: 0.88 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 240, damping: 17 },
  },
};

const CONFETTI_COLORS = [palette.accent, palette.accentSoft, palette.accentMid, palette.card];

/** One-shot light blue confetti burst behind the hero payment card. */
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
    <div className="pointer-events-none absolute inset-x-0 top-10 flex justify-center" aria-hidden="true">
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
      className="rounded-2xl border border-accentSoft bg-accentSoft/25 p-5"
    >
      <p className="text-[13px] font-semibold uppercase tracking-wide text-inkMuted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{children}</p>
      {sub ? <p className="mt-1 text-[12px] leading-snug text-inkMuted">{sub}</p> : null}
    </motion.div>
  );
}

function Crunching() {
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(
      () => setMsgIdx((i) => Math.min(i + 1, CRUNCH_MESSAGES.length - 1)),
      650
    );
    return () => window.clearInterval(timer);
  }, []);

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
          {CRUNCH_MESSAGES[msgIdx]}
        </motion.p>
      </AnimatePresence>
      <div className="flex items-center gap-2">
        {CRUNCH_MESSAGES.map((_, i) => (
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
  const [phase, setPhase] = useState<"crunching" | "ready">("crunching");

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase("ready"), 2000);
    return () => window.clearTimeout(timer);
  }, []);

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
  const breakdown = computeCosts(state.propertyPrice, state.residency, state.buyerStatus, state.costs);
  const ltv = state.propertyPrice > 0 ? loanAmount / state.propertyPrice : 0;
  const cashToClose = state.downPayment + breakdown.total;

  return (
    <motion.section
      custom={direction}
      variants={shellVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="mx-auto w-full max-w-2xl px-6 pb-24 pt-8 sm:pt-12"
    >
      <AnimatePresence mode="wait">
        {phase === "crunching" ? (
          <Crunching />
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
              className="text-[28px] font-semibold leading-[1.25] tracking-tight text-ink sm:text-[32px]"
            >
              Your mashkanta plan.
            </motion.h1>

            <motion.div
              variants={heroReveal}
              className="mt-7 rounded-3xl border border-accentSoft bg-accentSoft/35 p-7 text-center shadow-lift"
            >
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-inkMuted">
                Estimated monthly payment
              </p>
              <p className="mt-2 text-5xl font-bold text-ink sm:text-6xl">
                <CountUp value={plan.monthlyPayment} format={formatShekels} delay={0.15} />
              </p>
              <p className="mt-2 text-[14px] text-inkMuted">
                Blended across Prime, Kalatz, and Katz over {state.termYears} years
              </p>
            </motion.div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <MetricCard label="Total interest">
                <CountUp value={plan.totalInterest} format={formatShekels} delay={0.3} />
              </MetricCard>
              <MetricCard label="Total repayment">
                <CountUp value={plan.totalRepayment} format={formatShekels} delay={0.4} />
              </MetricCard>
              <MetricCard label="Loan to value" sub={`On a ${formatShekels(state.propertyPrice)} property`}>
                {formatPct(ltv)}
              </MetricCard>
              <MetricCard label="Cash to close" sub="Down payment plus taxes and fees">
                <CountUp value={cashToClose} format={formatShekels} delay={0.5} />
              </MetricCard>
            </div>

            <motion.div
              variants={cardReveal}
              className="mt-4 rounded-2xl border border-hairline bg-card p-5 shadow-lift"
            >
              <p className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-inkMuted">
                Your mix
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
                {plan.perTrack.map((track) => (
                  <div key={track.track} className="flex items-center gap-2 text-[13px] text-inkMuted">
                    <span
                      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-pill ${TRACK_BAR_CLASS[track.track]}`}
                      aria-hidden="true"
                    />
                    <span>
                      <span className="font-semibold text-ink">
                        {TRACK_INFO[track.track].name} {track.percent}%
                      </span>{" "}
                      · {formatShekels(track.monthlyPayment)}/mo
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={cardReveal}
              className="mt-4 rounded-2xl border border-hairline bg-card p-5 shadow-lift"
            >
              <p className="text-[13px] font-semibold uppercase tracking-wide text-inkMuted">
                If Prime rates rise
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink">
                Prime up 1 point:{" "}
                <span className="font-bold tabular-nums">{formatShekels(stress1)}</span>
                <span className="text-inkMuted"> (+{formatShekels(stress1 - plan.monthlyPayment)}/mo)</span>
                <br />
                Prime up 2 points:{" "}
                <span className="font-bold tabular-nums">{formatShekels(stress2)}</span>
                <span className="text-inkMuted"> (+{formatShekels(stress2 - plan.monthlyPayment)}/mo)</span>
              </p>
            </motion.div>

            <motion.div variants={cardReveal} className="mt-7 flex flex-col items-center gap-4">
              <div className="relative w-full sm:w-auto">
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-pill bg-hairline px-10 py-4 text-[16px] font-semibold text-inkMuted/70 sm:min-w-[260px]"
                >
                  Email me this plan
                </button>
                <span className="absolute -right-2 -top-2 rounded-pill bg-accentSoft px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink/70">
                  Soon
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  state.reset();
                  navigate("/simulator/welcome");
                }}
                className="text-[14px] font-semibold text-accent hover:text-accentDeep"
              >
                Start over
              </button>
            </motion.div>

            <motion.p
              variants={cardReveal}
              className="mt-8 text-center text-[12px] leading-relaxed text-inkMuted"
            >
              This is an estimate for planning purposes, not a binding offer. Rates, tax brackets,
              and eligibility rules change, a licensed mortgage advisor should confirm real terms
              with a bank.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
