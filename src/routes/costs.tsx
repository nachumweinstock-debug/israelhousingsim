import { useState } from "react";
import type { ReactNode } from "react";
import { ContinueButton, QuestionShell, Reveal } from "../components/QuestionShell";
import {
  computeCosts,
  estimatePurchaseTax,
  formatShekels,
} from "../lib/mortgageMath";
import { useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";

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
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-hairline bg-card p-5 shadow-lift">
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-ink">{label}</p>
        {note ? <p className="mt-0.5 text-[13px] leading-snug text-inkMuted">{note}</p> : null}
        {extra}
      </div>
      <div className="shrink-0 text-right">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            inputMode="decimal"
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
  const costs = useSimulatorStore((state) => state.costs);
  const setCosts = useSimulatorStore((state) => state.setCosts);
  const { goNext } = useFlowNav();

  const breakdown = computeCosts(propertyPrice, residency, buyerStatus, costs);
  const estimatedTax = estimatePurchaseTax(propertyPrice, residency, buyerStatus);
  const cashToClose = downPayment + breakdown.total;

  return (
    <QuestionShell
      wide
      title="The real cost to close."
      helper="Beyond the down payment, plan for these. Defaults are typical for Israeli deals, edit anything to match yours."
    >
      <Reveal>
        <CostField
          label="Purchase tax (mas rechisha)"
          note={
            residency === "oleh"
              ? "Estimate includes the possible oleh reduction, verify your eligibility."
              : "Estimated from simplified brackets, the exact figure depends on the deal."
          }
          value={breakdown.purchaseTax}
          onCommit={(value) => setCosts({ purchaseTaxOverride: value })}
          extra={
            costs.purchaseTaxOverride !== null ? (
              <button
                type="button"
                onClick={() => setCosts({ purchaseTaxOverride: null })}
                className="mt-1.5 text-[12px] font-semibold text-accent hover:text-accentDeep"
              >
                Reset to estimate ({formatShekels(estimatedTax)})
              </button>
            ) : null
          }
        />
      </Reveal>

      <Reveal>
        <CostField
          label="Legal fees"
          note="Plus VAT, typical range is 0.5% to 1.5% of the price."
          value={costs.legalPct}
          onCommit={(value) => setCosts({ legalPct: value })}
          suffix="%"
          computed={`≈ ${formatShekels(breakdown.legalFee)} incl. VAT`}
        />
      </Reveal>

      <Reveal>
        <CostField
          label="Agent commission"
          note="Plus VAT, skip by setting 0 if there's no agent."
          value={costs.agentPct}
          onCommit={(value) => setCosts({ agentPct: value })}
          suffix="%"
          computed={`≈ ${formatShekels(breakdown.agentFee)} incl. VAT`}
        />
      </Reveal>

      <Reveal>
        <CostField
          label="Appraiser & registration"
          note="Placeholder for appraisal, registration, and mortgage file fees."
          value={costs.otherFees}
          onCommit={(value) => setCosts({ otherFees: value })}
        />
      </Reveal>

      <Reveal className="rounded-2xl border border-accentSoft bg-accentSoft/25 px-5 py-4">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-semibold text-inkMuted">Costs beyond the loan</p>
          <p className="text-xl font-bold tabular-nums text-ink">{formatShekels(breakdown.total)}</p>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-accentSoft/70 pt-2">
          <p className="text-[14px] font-semibold text-inkMuted">
            Total cash to close (with down payment)
          </p>
          <p className="text-xl font-bold tabular-nums text-ink">{formatShekels(cashToClose)}</p>
        </div>
      </Reveal>

      <Reveal>
        <ContinueButton label="See my plan" onClick={goNext} />
      </Reveal>
    </QuestionShell>
  );
}
