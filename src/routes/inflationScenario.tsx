import { useRef, useState } from "react";
import { QuestionShell, Reveal } from "../components/QuestionShell";
import { ChoiceCard } from "../components/inputs/ChoiceCard";
import { INFLATION_CPI, formatPct } from "../lib/mortgageMath";
import type { InflationScenario as InflationValue } from "../lib/mortgageMath";
import { useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";

const OPTIONS: Array<{ value: InflationValue; title: string; subtitle: string; emoji: string }> = [
  {
    value: "low",
    title: "Low, around 1% a year",
    subtitle: "The Madad stays quiet",
    emoji: "🌤️",
  },
  {
    value: "medium",
    title: "Medium, around 2.5% a year",
    subtitle: "Near the Bank of Israel's target range",
    emoji: "🌥️",
  },
  {
    value: "high",
    title: "High, around 4% a year",
    subtitle: "Prices run hot for years",
    emoji: "🌡️",
  },
];

export function InflationScenario() {
  const inflation = useSimulatorStore((state) => state.inflation);
  const setInflation = useSimulatorStore((state) => state.setInflation);
  const katzShare = useSimulatorStore((state) => state.mix.katz);
  const { goNext } = useFlowNav();
  const [picked, setPicked] = useState<InflationValue | null>(null);
  const advancing = useRef(false);

  function pick(value: InflationValue) {
    if (advancing.current) return;
    advancing.current = true;
    setPicked(value);
    setInflation(value);
    window.setTimeout(goNext, 480);
  }

  const selected = picked ?? inflation;

  return (
    <QuestionShell
      title="How will inflation behave?"
      helper="Nobody knows, that's the point. This only moves the Katz (CPI linked) part of your mix, and it's the long run cost a plain calculator hides."
    >
      {OPTIONS.map((option) => (
        <ChoiceCard
          key={option.value}
          title={option.title}
          subtitle={option.subtitle}
          emoji={option.emoji}
          selected={selected === option.value}
          dimmed={picked !== null && picked !== option.value}
          onSelect={() => pick(option.value)}
        />
      ))}

      <Reveal>
        <p className="text-[13px] leading-relaxed text-inkMuted">
          {katzShare > 0
            ? `${katzShare}% of your mix is CPI linked, so this scenario compounds at ${formatPct(
                INFLATION_CPI[selected],
                1
              )} a year against that portion.`
            : "Your mix has no CPI linked track right now, so this choice barely moves your numbers."}
        </p>
      </Reveal>
    </QuestionShell>
  );
}
