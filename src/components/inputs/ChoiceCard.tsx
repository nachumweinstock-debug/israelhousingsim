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

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Big tap friendly answer card. Enters with the QuestionShell stagger and
 * settles with a plain ease, no spring, no overshoot. Selection is marked
 * by a drawn accent bar and a one-shot light sweep, not a scale pop.
 */
export function ChoiceCard({ title, subtitle, emoji, selected, dimmed, onSelect }: ChoiceCardProps) {
  return (
    <motion.button
      type="button"
      variants={revealVariants}
      onClick={onSelect}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.985 }}
      animate={{ opacity: dimmed ? 0.5 : 1 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-3xl border p-6 pe-16 text-start transition-shadow duration-300 ${
        selected
          ? "border-accent bg-gradient-to-br from-accentSoft/35 to-accentSoft/10 shadow-liftHover ring-2 ring-accent/25"
          : "border-hairline bg-card shadow-lift hover:shadow-liftHover"
      }`}
    >
      <motion.span
        aria-hidden="true"
        className="absolute inset-y-4 start-0 w-1 rounded-full bg-accent"
        style={{ transformOrigin: "center" }}
        initial={false}
        animate={{ scaleY: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
        transition={{ duration: 0.32, ease: EASE_OUT }}
      />
      {selected ? (
        <motion.span
          key="sheen"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)",
            backgroundSize: "260% 100%",
          }}
          initial={{ backgroundPosition: "260% 0", opacity: 1 }}
          animate={{ backgroundPosition: "-260% 0", opacity: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        />
      ) : null}

      {emoji ? (
        <span
          aria-hidden="true"
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${
            selected ? "bg-accentSoft/70" : "bg-cream"
          }`}
        >
          {emoji}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-[18px] font-semibold text-ink">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 block text-[15px] leading-snug text-inkMuted">{subtitle}</span>
        ) : null}
      </span>
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={selected ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
        transition={{ duration: 0.2, ease: EASE_OUT }}
        className="absolute end-6 top-1/2 -mt-3.5 flex h-7 w-7 items-center justify-center rounded-pill bg-accent text-sm font-bold text-white"
      >
        ✓
      </motion.span>
    </motion.button>
  );
}
