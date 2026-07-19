import { AnimatePresence, motion } from "framer-motion";
import { ContinueButton, QuestionShell, Reveal } from "../components/QuestionShell";
import { ChoiceCard } from "../components/inputs/ChoiceCard";
import { formatPct, ltvCeiling } from "../lib/mortgageMath";
import type { BuyerStatus as BuyerStatusValue, Residency } from "../lib/mortgageMath";
import { useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";

const OPTIONS: Array<{
  value: BuyerStatusValue;
  title: string;
  subtitle: string;
  emoji: string;
}> = [
  {
    value: "firstHome",
    title: "First home in Israel",
    subtitle: "Your first property here",
    emoji: "🔑",
  },
  {
    value: "replacingHome",
    title: "Replacing an existing home",
    subtitle: "Selling one place, buying another",
    emoji: "🏠",
  },
  {
    value: "investment",
    title: "Investment property",
    subtitle: "You already own where you live",
    emoji: "📊",
  },
];

function contextNote(residency: Residency | null, buyerStatus: BuyerStatusValue): string {
  const ceiling = formatPct(ltvCeiling(residency, buyerStatus));
  if (residency === "oleh") {
    return `As an oleh chadash, banks can generally lend you up to ${ceiling} of the property value.`;
  }
  if (residency === "foreign") {
    return `As a foreign resident, banks generally cap lending around ${ceiling} of the property value.`;
  }
  switch (buyerStatus) {
    case "firstHome":
      return `For a first home, banks can lend up to about ${ceiling}, plan for at least 25% down.`;
    case "replacingHome":
      return `When replacing a home, banks can lend up to about ${ceiling} of the new property's value.`;
    case "investment":
      return `For an investment property, lending is capped around ${ceiling}, half the price comes from you.`;
  }
}

export function BuyerStatus() {
  const residency = useSimulatorStore((state) => state.residency);
  const buyerStatus = useSimulatorStore((state) => state.buyerStatus);
  const setBuyerStatus = useSimulatorStore((state) => state.setBuyerStatus);
  const { goNext } = useFlowNav();

  return (
    <QuestionShell
      title="What are you buying?"
      helper="This sets how much of the price a bank is allowed to finance."
    >
      {OPTIONS.map((option) => (
        <ChoiceCard
          key={option.value}
          title={option.title}
          subtitle={option.subtitle}
          emoji={option.emoji}
          selected={buyerStatus === option.value}
          dimmed={buyerStatus !== null && buyerStatus !== option.value}
          onSelect={() => setBuyerStatus(option.value)}
        />
      ))}

      <AnimatePresence mode="wait">
        {buyerStatus ? (
          <motion.div
            key={buyerStatus}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-accentSoft bg-accentSoft/25 px-4 py-3 text-[14px] leading-relaxed text-ink/85"
          >
            {contextNote(residency, buyerStatus)}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Reveal>
        <ContinueButton onClick={goNext} disabled={buyerStatus === null} />
      </Reveal>
    </QuestionShell>
  );
}
