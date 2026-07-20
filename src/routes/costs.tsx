import { useState } from "react";
import type { ReactNode } from "react";
import { ContinueButton, InfoNote, QuestionShell, Reveal } from "../components/QuestionShell";
import { computeCosts, estimatePurchaseTax, formatShekels } from "../lib/mortgageMath";
import { fmt } from "../i18n";
import { useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";
import { useSimLang } from "../state/useSimLang";

interface FieldProps {
  label: string;
  note?: string;
  value: number;
  onCommit: (value: number) => void;
  suffix?: string;
  computed?: string;
  extra?: ReactNode;
}

/** Editable cost field, defaults pre filled, never presented as fixed truth. */
function CostField({ label, note, value, onCommit, suffix, computed, extra }: FieldProps) {
  const [draft, setDraft] = useState<string | null>(null);

  function commit() {
    if (draft !== null) {
      const parsed = Number(draft.replace(/[^\d.]/g, ""));
      if (!Number.isNaN(parsed) && draft.trim() !== "") onCommit(parsed);
    }
    setDraft(null);
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl border border-hairline bg-card p-6 shadow-lift">
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-ink">{label}</p>
        {note ? <p className="mt-0.5 text-[13px] leading-snug text-inkMuted">{note}</p> : null}
        {extra}
      </div>
      <div className="shrink-0 text-end">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            inputMode="decimal"
            dir="ltr"
            aria-label={label}
            className="noSpin w-28 rounded-xl border border-hairline bg-cream px-3 py-2 text-right text-[15px] tabular-nums text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
            value={draft ?? String(Math.round(value * 100) / 100)}
            onFocus={() => setDraft(String(Math.round(value * 100) / 100))}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
          />
          {suffix ? <span className="text-[14px] text-inkMuted">{suffix}</span> : null}
        </div>
        {computed ? (
          <p className="mt-1 text-[12px] tabular-nums text-inkMuted">{computed}</p>
        ) : null}
      </div>
    </div>
  );
}

export function Costs() {
  const propertyPrice = useSimulatorStore((state) => state.propertyPrice);
  const downPayment = useSimulatorStore((state) => state.downPayment);
  const residency = useSimulatorStore((state) => state.residency);
  const buyerStatus = useSimulatorStore((state) => state.buyerStatus);
  const existingHomeStatus = useSimulatorStore((state) => state.existingHomeStatus);
  const costs = useSimulatorStore((state) => state.costs);
  const setCosts = useSimulatorStore((state) => state.setCosts);
  const { goNext } = useFlowNav();
  const { s } = useSimLang();

  const breakdown = computeCosts(propertyPrice, residency, buyerStatus, costs, existingHomeStatus);
  const estimatedTax = estimatePurchaseTax(propertyPrice, residency, buyerStatus, existingHomeStatus);
  const cashToClose = downPayment + breakdown.total;

  return (
    <QuestionShell
      wide
      title={s.costs.title}
      helper={s.costs.helper}
      footer={<ContinueButton label={s.costs.continueLabel} onClick={goNext} />}
    >
      {buyerStatus === "replacingHome" && existingHomeStatus === "notListed" ? (
        <Reveal>
          <InfoNote>{s.existingHome.bridgeNote}</InfoNote>
        </Reveal>
      ) : null}

      <Reveal>
        <CostField
          label={s.costs.purchaseTaxLabel}
          note={residency === "oleh" ? s.costs.purchaseTaxNoteOleh : s.costs.purchaseTaxNote}
          value={breakdown.purchaseTax}
          onCommit={(value) => setCosts({ purchaseTaxOverride: value })}
          extra={
            costs.purchaseTaxOverride !== null ? (
              <button
                type="button"
                onClick={() => setCosts({ purchaseTaxOverride: null })}
                className="mt-1.5 text-[12px] font-semibold text-accent hover:text-accentDeep"
              >
                {fmt(s.costs.resetToEstimate, { amount: formatShekels(estimatedTax) })}
              </button>
            ) : null
          }
        />
      </Reveal>

      <Reveal>
        <CostField
          label={s.costs.legalLabel}
          note={s.costs.legalNote}
          value={costs.legalPct}
          onCommit={(value) => setCosts({ legalPct: value })}
          suffix="%"
          computed={fmt(s.costs.vatIncl, { amount: formatShekels(breakdown.legalFee) })}
        />
      </Reveal>

      <Reveal>
        <CostField
          label={s.costs.agentLabel}
          note={s.costs.agentNote}
          value={costs.agentPct}
          onCommit={(value) => setCosts({ agentPct: value })}
          suffix="%"
          computed={fmt(s.costs.vatIncl, { amount: formatShekels(breakdown.agentFee) })}
        />
      </Reveal>

      <Reveal>
        <CostField
          label={s.costs.otherLabel}
          note={s.costs.otherNote}
          value={costs.otherFees}
          onCommit={(value) => setCosts({ otherFees: value })}
        />
      </Reveal>

      <Reveal className="rounded-3xl border border-accentSoft bg-accentSoft/25 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[14px] font-semibold text-inkMuted">{s.costs.costsTotal}</p>
          <p className="text-[22px] font-bold tabular-nums text-ink">{formatShekels(breakdown.total)}</p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4 border-t border-accentSoft/70 pt-3">
          <p className="text-[14px] font-semibold text-inkMuted">{s.costs.cashTotal}</p>
          <p className="text-[22px] font-bold tabular-nums text-ink">{formatShekels(cashToClose)}</p>
        </div>
      </Reveal>
    </QuestionShell>
  );
}
