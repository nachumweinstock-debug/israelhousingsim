import type { MixResult } from "../types";
import { formatCurrency, formatPercent } from "../engine/format";
import { getTrack } from "../engine/tracks";
import { Badge } from "./ui/Badge";

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-warm-border bg-white p-5">
      <div className="text-xs uppercase tracking-wide text-navy-mid/60">{label}</div>
      <div className="mt-1 font-serif text-3xl text-navy">{value}</div>
      {sub && <div className="mt-1 text-xs text-navy-mid/60">{sub}</div>}
    </div>
  );
}

export function ResultsPanel({ result }: { result: MixResult }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Payment today" value={formatCurrency(result.paymentToday) + "/mo"} />
        <StatCard
          label="Highest expected payment"
          value={formatCurrency(result.paymentStressed) + "/mo"}
          sub="Under the CPI + stress-shock scenario"
        />
        <StatCard
          label="Total interest (life of loan)"
          value={formatCurrency(result.totalInterestStressed)}
          sub={`Baseline: ${formatCurrency(result.totalInterestBaseline)}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Loan-to-Value" value={formatPercent(result.ltv)} />
        <StatCard label="Payment-to-Income" value={formatPercent(result.pti)} />
        <StatCard label="Fixed share" value={formatPercent(result.fixedShare)} />
        <StatCard label="Effective term" value={`${result.effectiveTermYears} yrs`} />
      </div>

      <div className="rounded-xl border border-warm-border bg-white p-5">
        <h3 className="font-serif text-xl text-navy">Regulatory checks</h3>
        <div className="mt-3 space-y-3">
          {result.checks.map((check) => (
            <div key={check.id} className="flex flex-col gap-1 border-b border-warm-border/60 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-navy">{check.label}</span>
                <Badge status={check.status} />
              </div>
              <p className="text-sm text-navy-mid/80">{check.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-warm-border bg-white p-5">
        <h3 className="font-serif text-xl text-navy">By track</h3>
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-navy-mid/60">
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
                  <td className="py-2 text-navy">{getTrack(r.trackId).name}</td>
                  <td className="py-2 text-navy-mid/80">{formatCurrency(r.paymentToday)}</td>
                  <td className="py-2 text-navy-mid/80">{formatCurrency(r.paymentStressed)}</td>
                  <td className="py-2 text-navy-mid/80">{formatCurrency(r.totalInterestStressed)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-navy-mid/60">
        This is a simplified projection, not a bank-grade actuarial model — actual CPI and rate
        paths are unpredictable. Use it for planning, not as a guarantee.
      </p>
    </div>
  );
}
