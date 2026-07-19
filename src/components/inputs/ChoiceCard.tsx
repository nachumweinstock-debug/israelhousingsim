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
 * Big tap-friendly answer card. Participates in the QuestionShell stagger
 * on entry; pops on selection while unselected siblings dim.
 */
export function ChoiceCard({ title, subtitle, emoji, selected, dimmed, onSelect }: ChoiceCardProps) {
  return (
    <motion.button
      type="button"
      variants={revealVariants}
      onClick={onSelect}
      whileHover={{ y: -2, scale: 1.008 }}
      whileTap={{ scale: 0.98 }}
      animate={
        selected
          ? { scale: [1, 1.045, 1], opacity: 1 }
          : dimmed
            ? { scale: 0.985, opacity: 0.45 }
            : { scale: 1, opacity: 1 }
      }
      transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
      className={`relative flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-shadow ${
        selected
          ? "border-accent bg-accentSoft/25 shadow-liftHover ring-2 ring-accent/25"
          : "border-hairline bg-card shadow-lift hover:shadow-liftHover"
      }`}
    >
      {selected ? (
        <motion.span
          key="selectionBurst"
          aria-hidden="true"
          initial={{ opacity: 0.7, scale: 1 }}
          animate={{ opacity: 0, scale: 1.09 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-accent"
        />
      ) : null}
      {emoji ? (
        <span
          aria-hidden="true"
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${
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
        animate={selected ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-accent text-sm font-bold text-white"
      >
        ✓
      </motion.span>
    </motion.button>
  );
}
