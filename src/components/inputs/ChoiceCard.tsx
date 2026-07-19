import { motion } from "framer-motion";
import { revealVariants } from "../QuestionShell";

interface ChoiceCardProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  selected: boolean;
  /** True when a sibling was just picked, this card steps back visually */
  dimmed?: boolean;
  onSelect: () => void;
}

/**
 * Big tap friendly answer card. Enters with the QuestionShell stagger,
 * settles calmly, and marks selection with a check that doesn't shift the
 * layout (absolutely positioned at the inline end).
 */
export function ChoiceCard({ title, subtitle, emoji, selected, dimmed, onSelect }: ChoiceCardProps) {
  return (
    <motion.button
      type="button"
      variants={revealVariants}
      onClick={onSelect}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.985 }}
      animate={
        selected
          ? { scale: [1, 1.015, 1], opacity: 1 }
          : dimmed
            ? { scale: 1, opacity: 0.5 }
            : { scale: 1, opacity: 1 }
      }
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex w-full items-center gap-4 rounded-2xl border p-5 pe-14 text-start transition-shadow ${
        selected
          ? "border-accent bg-accentSoft/25 shadow-liftHover ring-2 ring-accent/25"
          : "border-hairline bg-card shadow-lift hover:shadow-liftHover"
      }`}
    >
      {emoji ? (
        <span
          aria-hidden="true"
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${
            selected ? "bg-accentSoft/70" : "bg-cream"
          }`}
        >
          {emoji}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] font-semibold text-ink">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 block text-[14px] leading-snug text-inkMuted">{subtitle}</span>
        ) : null}
      </span>
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={selected ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute end-5 top-1/2 -mt-3.5 flex h-7 w-7 items-center justify-center rounded-pill bg-accent text-sm font-bold text-white"
      >
        ✓
      </motion.span>
    </motion.button>
  );
}
