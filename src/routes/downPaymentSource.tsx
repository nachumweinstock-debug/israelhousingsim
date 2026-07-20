import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { InfoNote, QuestionShell } from "../components/QuestionShell";
import { ChoiceCard } from "../components/inputs/ChoiceCard";
import type { DownPaymentSourceType, HomeSaleFundsStatus } from "../lib/mortgageMath";
import { useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";
import { useSimLang } from "../state/useSimLang";

const OPTION_EMOJI: Record<DownPaymentSourceType, string> = {
  savings: "🏦",
  homeSale: "🏡",
  gift: "🎁",
  other: "📄",
};

const OPTION_ORDER: DownPaymentSourceType[] = ["savings", "homeSale", "gift", "other"];

export function DownPaymentSource() {
  const downPaymentSource = useSimulatorStore((state) => state.downPaymentSource);
  const setDownPaymentSource = useSimulatorStore((state) => state.setDownPaymentSource);
  const { goNext } = useFlowNav();
  const { s } = useSimLang();
  const [picked, setPicked] = useState<DownPaymentSourceType | null>(downPaymentSource.source);
  const advancing = useRef(false);

  function pickSource(value: DownPaymentSourceType) {
    setPicked(value);
    setDownPaymentSource({ source: value, homeSaleStatus: null });
    if (value === "homeSale") return; // wait for the follow up question
    if (advancing.current) return;
    advancing.current = true;
    window.setTimeout(goNext, value === "gift" ? 1500 : 450);
  }

  function pickHomeSaleStatus(value: HomeSaleFundsStatus) {
    if (advancing.current) return;
    advancing.current = true;
    setDownPaymentSource({ homeSaleStatus: value });
    window.setTimeout(goNext, value === "pending" ? 1500 : 450);
  }

  return (
    <QuestionShell title={s.downPaymentSource.title} helper={s.downPaymentSource.helper}>
      {OPTION_ORDER.map((value, i) => (
        <ChoiceCard
          key={value}
          index={i}
          title={s.downPaymentSource[value].title}
          subtitle={s.downPaymentSource[value].sub}
          emoji={OPTION_EMOJI[value]}
          selected={picked === value}
          dimmed={picked !== null && picked !== value}
          onSelect={() => pickSource(value)}
        />
      ))}

      <AnimatePresence>
        {picked === "gift" ? (
          <motion.div
            key="giftNote"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <InfoNote>{s.downPaymentSource.giftNote}</InfoNote>
          </motion.div>
        ) : null}

        {picked === "homeSale" ? (
          <motion.div
            key="homeSaleFollowUp"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p className="mb-3 text-center text-[15px] font-semibold text-ink">
              {s.downPaymentSource.homeSaleQuestion}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <ChoiceCard
                index={0}
                title={s.downPaymentSource.inHand}
                selected={downPaymentSource.homeSaleStatus === "inHand"}
                dimmed={downPaymentSource.homeSaleStatus === "pending"}
                onSelect={() => pickHomeSaleStatus("inHand")}
              />
              <ChoiceCard
                index={1}
                title={s.downPaymentSource.pending}
                selected={downPaymentSource.homeSaleStatus === "pending"}
                dimmed={downPaymentSource.homeSaleStatus === "inHand"}
                onSelect={() => pickHomeSaleStatus("pending")}
              />
            </div>
            {downPaymentSource.homeSaleStatus === "pending" ? (
              <div className="mt-4">
                <InfoNote>{s.downPaymentSource.pendingNote}</InfoNote>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </QuestionShell>
  );
}
