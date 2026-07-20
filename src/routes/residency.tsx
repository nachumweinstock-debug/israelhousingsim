import { useRef, useState } from "react";
import { QuestionShell } from "../components/QuestionShell";
import { ChoiceCard } from "../components/inputs/ChoiceCard";
import type { Residency as ResidencyValue } from "../lib/mortgageMath";
import { useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";
import { useSimLang } from "../state/useSimLang";

const OPTION_EMOJI: Record<ResidencyValue, string> = {
  israeli: "🏡",
  oleh: "✈️",
  foreign: "🌍",
};

const OPTION_ORDER: ResidencyValue[] = ["israeli", "oleh", "foreign"];

export function Residency() {
  const residency = useSimulatorStore((state) => state.residency);
  const setResidency = useSimulatorStore((state) => state.setResidency);
  const { goNext } = useFlowNav();
  const { s } = useSimLang();
  const [picked, setPicked] = useState<ResidencyValue | null>(residency);
  const advancing = useRef(false);

  function pick(value: ResidencyValue) {
    if (advancing.current) return;
    advancing.current = true;
    setPicked(value);
    setResidency(value);
    window.setTimeout(goNext, 450);
  }

  return (
    <QuestionShell title={s.residency.title} helper={s.residency.helper}>
      {OPTION_ORDER.map((value, i) => (
        <ChoiceCard
          key={value}
          index={i}
          title={s.residency[value].title}
          subtitle={s.residency[value].sub}
          emoji={OPTION_EMOJI[value]}
          selected={picked === value}
          dimmed={picked !== null && picked !== value}
          onSelect={() => pick(value)}
        />
      ))}
    </QuestionShell>
  );
}
