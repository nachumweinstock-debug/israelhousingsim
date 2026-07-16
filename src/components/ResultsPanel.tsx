import type { MixResult } from "../types";
import { formatCurrency, formatPercent } from "../engine/format";
import { getTrack } from "../engine/tracks";
import { Badge } from "./ui/Badge";
import { glow, revealDelay, softCardBorder, softCardGradient, softCardShadow } from "../styles/brand";

function StatCard({
  label,
  value,
  sub,
  accent,
  index = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  index?: number;
}) {
  return (
    <div
      className="rounded-2xl p-5 mb-reveal"
      style={{
        background: softCardGradient,
        border: softCardBorder,
        boxShadow: softCardShadow,
        ...revealDelay(index),
      }}
    >
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/45">{label}</div>
      <div
        className="mt-1.5 font-serif text-3xl tabular-nums text-navy"
        style={accent ? { filter: glow(accent) } : undefined}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-navy-mid/55">{sub}</div>}
    </div>
  );
}

export function ResultsPanel({ result }: { result: MixResult }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Payment today" value={formatCurrency(result.paymentToday) + "/mo"} index={0} />
        <StatCard
          label="Highest expected payment"
          value={formatCurrency(result.paymentStressed) + "/mo"}
          sub="Under the CPI + stress-shock scenario"
          accent="#B7791F"
          index={1}
        />
        <StatCard
          label="Total interest (life of loan)"
          value={formatCurrency(result.totalInterestStressed)}
          sub={`Baseline: ${formatCurrency(result.totalInterestBaseline)}`}
          index={2}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Loan-to-Value" value={formatPercent(result.ltv)} index={3} />
        <StatCard label="Payment-to-Income" value={formatPercent(result.pti)} index={4} />
        <StatCard label="Fixed share" value={formatPercent(result.fixedShare)} index={5} />
        <StatCard label="Effective term" value={`${result.effectiveTermYears} yrs`} index={6} />
      </div>

      <div
        className="rounded-2xl p-5"
        style={{ background: "white", border: softCardBorder, boxShadow: softCardShadow }}
      >
        <h3 className="font-serif text-xl text-navy">Regulatory checks</h3>
        <div className="mt-3 space-y-3">
          {result.checks.map((check) => (
            <div
              key={check.id}
              className="flex flex-col gap-1.5 border-b border-warm-border/60 pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-navy">{check.label}</span>
                <Badge status={check.status} />
              </div>
              <p className="text-sm leading-relaxed text-navy-mid/75">{check.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl p-5"
        style={{ background: "white", border: softCardBorder, boxShadow: softCardShadow }}
      >
        <h3 className="font-serif text-xl text-navy">By track</h3>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.14em] text-navy/40">
              <th className="pb-2">Track</th>
              <th className="pb-2">Payment today</th>
              <th className="pb-2">Highest expected</th>
              <th className="pb-2">Total interest</th>
            </tr>
          </thead>
          <tbody>
            {result.trackResults
              .filter((r) => r.allocationAmount > 0)
              .map((r) => (
                <tr key={r.trackId} className="border-t border-warm-border/60">
                  <td className="py-2.5 font-medium text-navy">{getTrack(r.trackId).name}</td>
                  <td className="py-2.5 tabular-nums text-navy-mid/80">{formatCurrency(r.paymentToday)}</td>
                  <td className="py-2.5 tabular-nums text-navy-mid/80">{formatCurrency(r.paymentStressed)}</td>
                  <td className="py-2.5 tabular-nums text-navy-mid/80">{formatCurrency(r.totalInterestStressed)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs leading-relaxed text-navy-mid/50">
        This is a simplified projection, not a bank-grade actuarial model — actual CPI and rate
        paths are unpredictable. Use it for planning, not as a guarantee.
      </p>
    </div>
  );
}
