import { useRef, useState } from "react";
import { QuestionShell } from "../components/QuestionShell";
import { ChoiceCard } from "../components/inputs/ChoiceCard";
import type { Residency as ResidencyValue } from "../lib/mortgageMath";
import { useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";

const OPTIONS: Array<{ value: ResidencyValue; title: string; subtitle: string; emoji: string }> = [
  {
    value: "israeli",
    title: "Israeli resident",
    subtitle: "Living in Israel with citizenship or residency",
    emoji: "🏡",
  },
  {
    value: "oleh",
    title: "Oleh chadash",
    subtitle: "New immigrant, extra benefits may apply",
    emoji: "✈️",
  },
  {
    value: "foreign",
    title: "Foreign resident",
    subtitle: "Buying from abroad, stricter lending caps",
    emoji: "🌍",
  },
];

export function Residency() {
  const residency = useSimulatorStore((state) => state.residency);
  const setResidency = useSimulatorStore((state) => state.setResidency);
  const { goNext } = useFlowNav();
  const [picked, setPicked] = useState<ResidencyValue | null>(residency);
  const advancing = useRef(false);

  function pick(value: ResidencyValue) {
    if (advancing.current) return;
    advancing.current = true;
    setPicked(value);
    setResidency(value);
    window.setTimeout(goNext, 480);
  }

  return (
    <QuestionShell
      title="Where do you stand with Israeli residency?"
      helper="This one matters a lot, how much banks can lend you and which benefits you can claim differ sharply by answer."
    >
      {OPTIONS.map((option) => (
        <ChoiceCard
          key={option.value}
          title={option.title}
          subtitle={option.subtitle}
          emoji={option.emoji}
          selected={picked === option.value}
          dimmed={picked !== null && picked !== option.value}
          onSelect={() => pick(option.value)}
        />
      ))}
    </QuestionShell>
  );
}
