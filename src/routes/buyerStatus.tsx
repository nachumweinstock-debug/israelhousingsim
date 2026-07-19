import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QuestionShell } from "../components/QuestionShell";
import { ChoiceCard } from "../components/inputs/ChoiceCard";
import { formatPct, ltvCeiling } from "../lib/mortgageMath";
import type { BuyerStatus as BuyerStatusValue, Residency } from "../lib/mortgageMath";
import { fmt } from "../i18n";
import type { SimStrings } from "../state/texts";
import { useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";
import { useSimLang } from "../state/useSimLang";

const OPTION_EMOJI: Record<BuyerStatusValue, string> = {
  firstHome: "🔑",
  replacingHome: "🏠",
  investment: "📊",
};

const OPTION_ORDER: BuyerStatusValue[] = ["firstHome", "replacingHome", "investment"];

function contextNote(
  s: SimStrings,
  residency: Residency | null,
  buyerStatus: BuyerStatusValue
): string {
  const ceiling = formatPct(ltvCeiling(residency, buyerStatus));
  if (residency === "oleh") return fmt(s.buyerStatus.olehNote, { ceiling });
  if (residency === "foreign") return fmt(s.buyerStatus.foreignNote, { ceiling });
  switch (buyerStatus) {
    case "firstHome":
      return fmt(s.buyerStatus.firstHomeNote, { ceiling });
    case "replacingHome":
      return fmt(s.buyerStatus.replacingNote, { ceiling });
    case "investment":
      return fmt(s.buyerStatus.investmentNote, { ceiling });
  }
}

export function BuyerStatus() {
  const residency = useSimulatorStore((state) => state.residency);
  const buyerStatus = useSimulatorStore((state) => state.buyerStatus);
  const setBuyerStatus = useSimulatorStore((state) => state.setBuyerStatus);
  const { goNext } = useFlowNav();
  const { s } = useSimLang();
  const [picked, setPicked] = useState<BuyerStatusValue | null>(null);
  const advancing = useRef(false);

  function pick(value: BuyerStatusValue) {
    if (advancing.current) return;
    advancing.current = true;
    setPicked(value);
    setBuyerStatus(value);
    // A beat longer than usual so the loan to value note registers.
    window.setTimeout(goNext, 950);
  }

  const selected = picked ?? buyerStatus;

  return (
    <QuestionShell title={s.buyerStatus.title} helper={s.buyerStatus.helper}>
      {OPTION_ORDER.map((value) => (
        <ChoiceCard
          key={value}
          title={s.buyerStatus[value].title}
          subtitle={s.buyerStatus[value].sub}
          emoji={OPTION_EMOJI[value]}
          selected={selected === value}
          dimmed={picked !== null && picked !== value}
          onSelect={() => pick(value)}
        />
      ))}

      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-accentSoft bg-accentSoft/25 px-4 py-3 text-center text-[14px] leading-relaxed text-ink/85"
          >
            {contextNote(s, residency, selected)}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </QuestionShell>
  );
}
