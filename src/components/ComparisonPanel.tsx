import type { Assumptions, BorrowerProfile, Mix, MixResult, RegulatoryRuleSet } from "../types";
import { BASKETS } from "../engine/baskets";
import { computeMixResult } from "../engine/mix";
import { getTrack } from "../engine/tracks";
import { formatCurrency, formatPercent } from "../engine/format";
import { softCardBorder, softCardShadow } from "../styles/brand";

function basketToMix(basketId: string): Mix {
  const basket = BASKETS.find((b) => b.id === basketId)!;
  return {
    id: basket.id,
    name: basket.name,
    allocations: basket.allocations.map((a) => ({
      trackId: a.trackId,
      percent: a.percent,
      annualRate: getTrack(a.trackId).defaultAnnualRate,
    })),
  };
}

export function ComparisonPanel({
  userMixResult,
  profile,
  assumptions,
  ruleSet,
}: {
  userMixResult: MixResult;
  profile: BorrowerProfile;
  assumptions: Assumptions;
  ruleSet: RegulatoryRuleSet;
}) {
  const rows: Array<{ label: string; result: MixResult; description?: string; isUserMix?: boolean }> = [
    { label: "Your mix", result: userMixResult, isUserMix: true },
    ...BASKETS.map((b) => ({
      label: b.name,
      result: computeMixResult(basketToMix(b.id), profile, assumptions, ruleSet),
      description: b.description,
    })),
  ];

  return (
    <div
      className="overflow-x-auto rounded-2xl"
      style={{ background: "white", border: softCardBorder, boxShadow: softCardShadow }}
    >
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-warm-border text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/40">
            <th className="p-4">Mix</th>
            <th className="p-4">Payment today</th>
            <th className="p-4">Highest expected</th>
            <th className="p-4">Total interest</th>
            <th className="p-4">Fixed share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className={`border-b border-warm-border/60 last:border-0 ${row.isUserMix ? "bg-sky-soft/40" : ""}`}
            >
              <td className="p-4">
                <div className={`font-semibold ${row.isUserMix ? "text-navy" : "text-navy/85"}`}>
                  {row.label}
                </div>
                {row.description && <div className="text-xs text-navy-mid/55">{row.description}</div>}
              </td>
              <td className="p-4 tabular-nums text-navy-mid/80">{formatCurrency(row.result.paymentToday)}</td>
              <td className="p-4 tabular-nums text-navy-mid/80">{formatCurrency(row.result.paymentStressed)}</td>
              <td className="p-4 tabular-nums text-navy-mid/80">
                {formatCurrency(row.result.totalInterestStressed)}
              </td>
              <td className="p-4 tabular-nums text-navy-mid/80">{formatPercent(row.result.fixedShare)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
