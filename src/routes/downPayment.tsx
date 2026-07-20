import { useState } from "react";
import { motion } from "framer-motion";
import { ContinueButton, QuestionShell, Reveal } from "../components/QuestionShell";
import { AmountSlider } from "../components/inputs/AmountSlider";
import { formatPct, formatShekels, ltvCeiling } from "../lib/mortgageMath";
import { fmt } from "../i18n";
import { loanAmountOf, useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";
import { useSimLang } from "../state/useSimLang";

type EntryMode = "shekels" | "percent";

export function DownPayment() {
  const propertyPrice = useSimulatorStore((state) => state.propertyPrice);
  const downPayment = useSimulatorStore((state) => state.downPayment);
  const setDownPayment = useSimulatorStore((state) => state.setDownPayment);
  const residency = useSimulatorStore((state) => state.residency);
  const buyerStatus = useSimulatorStore((state) => state.buyerStatus);
  const { goNext } = useFlowNav();
  const { s } = useSimLang();
  const [mode, setMode] = useState<EntryMode>("shekels");

  const loanAmount = loanAmountOf({ propertyPrice, downPayment });
  const ltv = propertyPrice > 0 ? loanAmount / propertyPrice : 0;
  const ceiling = ltvCeiling(residency, buyerStatus);
  const downPct = propertyPrice > 0 ? (downPayment / propertyPrice) * 100 : 0;

  return (
    <QuestionShell
      title={s.down.title}
      helper={s.down.helper}
      footer={<ContinueButton label={s.common.continueLabel} onClick={goNext} />}
    >
      <Reveal className="rounded-3xl border border-hairline bg-card p-7 shadow-lift">
        <div className="mb-5 flex justify-center gap-2">
          {(
            [
              { id: "shekels", label: s.down.modeShekels },
              { id: "percent", label: s.down.modePercent },
            ] as Array<{ id: EntryMode; label: string }>
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setMode(option.id)}
              className={`rounded-pill border px-4 py-2 text-[14px] font-semibold transition-colors ${
                mode === option.id
                  ? "border-accent bg-accent text-white"
                  : "border-hairline bg-card text-ink hover:border-accent/60"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {mode === "shekels" ? (
          <AmountSlider
            ariaLabel={s.down.title}
            value={downPayment}
            onChange={setDownPayment}
            min={0}
            max={propertyPrice}
            step={10_000}
            format={formatShekels}
            editable
          />
        ) : (
          <AmountSlider
            ariaLabel={s.down.title}
            value={Math.round(downPct)}
            onChange={(pct) => setDownPayment(Math.round((propertyPrice * pct) / 100))}
            min={0}
            max={100}
            unit="%"
          />
        )}

        <p className="mt-4 text-[14px] text-inkMuted">
          {mode === "shekels"
            ? fmt(s.down.pctOfPrice, { pct: Math.round(downPct) })
            : fmt(s.down.amountIs, { amount: formatShekels(downPayment) })}
        </p>
      </Reveal>

      <Reveal>
        <motion.div
          layout
          className="flex items-center justify-between rounded-3xl border border-accentSoft bg-accentSoft/25 px-6 py-5"
        >
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-inkMuted">
              {s.down.loanAmount}
            </p>
            <p className="text-[26px] font-bold tabular-nums text-ink">{formatShekels(loanAmount)}</p>
          </div>
          <div className="text-end">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-inkMuted">
              {s.down.ltv}
            </p>
            <p className="text-[26px] font-bold tabular-nums text-ink">{formatPct(ltv)}</p>
          </div>
        </motion.div>
        {ltv > ceiling ? (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-3xl border border-warn/25 bg-warn/5 px-5 py-4 text-[14px] leading-relaxed text-warn"
          >
            {fmt(s.down.warning, { ceiling: formatPct(ceiling) })}
          </motion.p>
        ) : null}
      </Reveal>
    </QuestionShell>
  );
}
