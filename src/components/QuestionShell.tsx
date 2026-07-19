import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * Direction of travel through the flow: 1 = forward, -1 = backward.
 * Provided by SimulatorApp, consumed by every QuestionShell so enter and
 * exit slides always play the right way, including browser back/forward.
 */
export const FlowDirectionContext = createContext<1 | -1>(1);

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const shellVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 96 : -96,
    opacity: 0,
    scale: 0.975,
    filter: "blur(8px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      x: { type: "spring" as const, stiffness: 320, damping: 30 },
      scale: { type: "spring" as const, stiffness: 320, damping: 30 },
      opacity: { duration: 0.3, ease: EASE_OUT },
      filter: { duration: 0.32, ease: EASE_OUT },
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -80 : 80,
    opacity: 0,
    scale: 0.975,
    filter: "blur(6px)",
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] as const },
  }),
};

export const revealVariants = {
  enter: { opacity: 0, y: 26, scale: 0.98 },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      y: { type: "spring" as const, stiffness: 380, damping: 26 },
      scale: { type: "spring" as const, stiffness: 380, damping: 26 },
      opacity: { duration: 0.35, ease: EASE_OUT },
    },
  },
};

/** Staggered child of a QuestionShell, fades and rises in on its beat. */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={revealVariants} className={className}>
      {children}
    </motion.div>
  );
}

interface QuestionShellProps {
  title: string;
  helper?: string;
  children?: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

/**
 * Shared wrapper for every question screen: direction-aware slide/fade
 * transition plus staggered content reveal. The progress bar and back
 * arrow are persistent chrome and live in SimulatorApp, outside the
 * animated region.
 */
export function QuestionShell({ title, helper, children, footer, wide }: QuestionShellProps) {
  const direction = useContext(FlowDirectionContext);
  return (
    <motion.section
      custom={direction}
      variants={shellVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className={`mx-auto w-full ${wide ? "max-w-2xl" : "max-w-xl"} px-6 pb-24 pt-8 sm:pt-14`}
    >
      <motion.h1
        variants={revealVariants}
        className="text-[28px] font-semibold leading-[1.25] tracking-tight text-ink sm:text-[32px]"
      >
        {title}
      </motion.h1>
      {helper ? (
        <motion.p variants={revealVariants} className="mt-3 text-[15px] leading-relaxed text-inkMuted">
          {helper}
        </motion.p>
      ) : null}
      <div className="mt-8 space-y-5">{children}</div>
      {footer ? (
        <motion.div variants={revealVariants} className="mt-10">
          {footer}
        </motion.div>
      ) : null}
    </motion.section>
  );
}

interface ContinueButtonProps {
  label?: string;
  onClick: () => void;
  disabled?: boolean;
}

export function ContinueButton({ label = "Continue", onClick, disabled }: ContinueButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -1, scale: 1.015 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`w-full rounded-pill px-8 py-4 text-[17px] font-semibold transition-colors sm:w-auto sm:min-w-[220px] ${
        disabled
          ? "cursor-not-allowed bg-hairline text-inkMuted/60"
          : "bg-accent text-white hover:bg-accentDeep"
      }`}
    >
      {label}
    </motion.button>
  );
}

/** Soft informational note card, used for benefit explanations and caveats. */
export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-accentSoft bg-accentSoft/25 p-4 text-[14px] leading-relaxed text-ink/85">
      {children}
    </div>
  );
}
