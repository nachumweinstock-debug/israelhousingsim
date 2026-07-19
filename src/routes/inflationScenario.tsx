import { useRef, useState } from "react";
import { QuestionShell, Reveal } from "../components/QuestionShell";
import { ChoiceCard } from "../components/inputs/ChoiceCard";
import { INFLATION_CPI, formatPct } from "../lib/mortgageMath";
import type { InflationScenario as InflationValue } from "../lib/mortgageMath";
import { fmt } from "../i18n";
import { useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";
import { useSimLang } from "../state/useSimLang";

const OPTION_EMOJI: Record<InflationValue, string> = {
  low: "🌤️",
  medium: "🌥️",
  high: "🌡️",
};

const OPTION_ORDER: InflationValue[] = ["low", "medium", "high"];

export function InflationScenario() {
  const inflation = useSimulatorStore((state) => state.inflation);
  const setInflation = useSimulatorStore((state) => state.setInflation);
  const katzShare = useSimulatorStore((state) => state.mix.katz);
  const { goNext } = useFlowNav();
  const { s } = useSimLang();
  const [picked, setPicked] = useState<InflationValue | null>(null);
  const advancing = useRef(false);

  function pick(value: InflationValue) {
    if (advancing.current) return;
    advancing.current = true;
    setPicked(value);
    setInflation(value);
    window.setTimeout(goNext, 450);
  }

  const selected = picked ?? inflation;

  return (
    <QuestionShell title={s.inflation.title} helper={s.inflation.helper}>
      {OPTION_ORDER.map((value) => (
        <ChoiceCard
          key={value}
          title={s.inflation[value].title}
          subtitle={s.inflation[value].sub}
          emoji={OPTION_EMOJI[value]}
          selected={selected === value}
          dimmed={picked !== null && picked !== value}
          onSelect={() => pick(value)}
        />
      ))}

      <Reveal>
        <p className="text-center text-[13px] leading-relaxed text-inkMuted">
          {katzShare > 0
            ? fmt(s.inflation.linkedNote, {
                share: katzShare,
                rate: formatPct(INFLATION_CPI[selected], 1),
              })
            : s.inflation.noneNote}
        </p>
      </Reveal>
    </QuestionShell>
  );
}
