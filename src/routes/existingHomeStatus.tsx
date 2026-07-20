import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { InfoNote, QuestionShell } from "../components/QuestionShell";
import { ChoiceCard } from "../components/inputs/ChoiceCard";
import type { ExistingHomeStatusType } from "../lib/mortgageMath";
import { useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";
import { useSimLang } from "../state/useSimLang";

const OPTION_EMOJI: Record<ExistingHomeStatusType, string> = {
  sold: "✅",
  underContract: "📝",
  notListed: "🏚️",
};

const OPTION_ORDER: ExistingHomeStatusType[] = ["sold", "underContract", "notListed"];

export function ExistingHomeStatus() {
  const buyerStatus = useSimulatorStore((state) => state.buyerStatus);
  const existingHomeStatus = useSimulatorStore((state) => state.existingHomeStatus);
  const setExistingHomeStatus = useSimulatorStore((state) => state.setExistingHomeStatus);
  const { goNext } = useFlowNav();
  const { s } = useSimLang();
  const [picked, setPicked] = useState<ExistingHomeStatusType | null>(existingHomeStatus);
  const advancing = useRef(false);

  // This branch only exists for buyers replacing a home, anyone else lands on the next step.
  if (buyerStatus !== "replacingHome") {
    return <Navigate to="/simulator/incomeDebt" replace />;
  }

  function pick(value: ExistingHomeStatusType) {
    if (advancing.current) return;
    advancing.current = true;
    setPicked(value);
    setExistingHomeStatus(value);
    // Give the bridge caution a moment to be read before moving on.
    window.setTimeout(goNext, value === "notListed" ? 1600 : 450);
  }

  return (
    <QuestionShell title={s.existingHome.title} helper={s.existingHome.helper}>
      {OPTION_ORDER.map((value) => (
        <ChoiceCard
          key={value}
          title={s.existingHome[value].title}
          subtitle={s.existingHome[value].sub}
          emoji={OPTION_EMOJI[value]}
          selected={picked === value}
          dimmed={picked !== null && picked !== value}
          onSelect={() => pick(value)}
        />
      ))}
      {picked === "notListed" ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <InfoNote>{s.existingHome.bridgeNote}</InfoNote>
        </motion.div>
      ) : null}
    </QuestionShell>
  );
}
