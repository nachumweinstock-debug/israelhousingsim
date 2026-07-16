import type { Mix } from "../types";
import { DEFAULT_TRACKS, getTrack } from "../engine/tracks";
import { RULE_SET } from "../engine/rules";
import { computeShares, getTrack as getTrackFromValidation } from "../engine/validation";
import { allocationTotal } from "../engine/mix";
import { formatPercent } from "../engine/format";
import { Badge } from "./ui/Badge";
import { revealDelay, softCardBorder, softCardGradient, softCardShadow } from "../styles/brand";

export function TrackMixBuilder({ mix, onChange }: { mix: Mix; onChange: (mix: Mix) => void }) {
  function setAllocation(trackId: string, patch: Partial<{ percent: number; annualRate: number }>) {
    const exists = mix.allocations.some((a) => a.trackId === trackId);
    const allocations = exists
      ? mix.allocations.map((a) => (a.trackId === trackId ? { ...a, ...patch } : a))
      : [
          ...mix.allocations,
          {
            trackId,
            percent: patch.percent ?? 0,
            annualRate: patch.annualRate ?? getTrack(trackId).defaultAnnualRate,
          },
        ];
    onChange({ ...mix, allocations });
  }

  const total = allocationTotal(mix);
  const { fixedShare, variableShare } = computeShares(mix, getTrackFromValidation);
  const totalOk = Math.abs(total - 100) < 0.01;
  const fixedOk = fixedShare >= RULE_SET.minFixedShare;
  const variableOk = variableShare <= RULE_SET.maxVariableShare;

  return (
    <div className="space-y-6">
      <div
        className="flex flex-wrap items-center gap-4 rounded-2xl p-4"
        style={{ background: softCardGradient, border: softCardBorder, boxShadow: softCardShadow }}
      >
        <div className="flex-1 min-w-[160px]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/45">Allocated</div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-navy/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(total, 100)}%`,
                background: totalOk ? "#2F855A" : "#B7791F",
              }}
            />
          </div>
          <div className="mt-1 text-xs font-medium text-navy-mid/70">
            {total.toFixed(0)}% {totalOk ? "" : "— should total 100%"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-navy-mid/60">Fixed</span>
          <Badge status={fixedOk ? "pass" : "fail"} />
          <span className="font-serif text-navy">{formatPercent(fixedShare)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-navy-mid/60">Variable</span>
          <Badge status={variableOk ? "pass" : "fail"} />
          <span className="font-serif text-navy">{formatPercent(variableShare)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {DEFAULT_TRACKS.map((track, i) => {
          const alloc = mix.allocations.find((a) => a.trackId === track.id);
          const percent = alloc?.percent ?? 0;
          const rate = alloc?.annualRate ?? track.defaultAnnualRate;
          return (
            <div
              key={track.id}
              className="grid grid-cols-1 items-center gap-4 rounded-2xl p-4 mb-reveal sm:grid-cols-[1fr_auto_auto]"
              style={{
                background: "white",
                border: softCardBorder,
                boxShadow: softCardShadow,
                ...revealDelay(i),
              }}
            >
              <div>
                <div className="font-semibold text-navy">{track.name}</div>
                <div className="text-xs text-navy-mid/60" dir="rtl">
                  {track.nameHe}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-xs font-medium text-navy-mid/50">Allocation</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={percent}
                  onChange={(e) => setAllocation(track.id, { percent: e.target.valueAsNumber || 0 })}
                  className="w-20 rounded-lg border border-warm-border px-2 py-1.5 text-navy outline-none transition-colors focus:border-sky-accent"
                />
                <span className="text-navy-mid/50">%</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-xs font-medium text-navy-mid/50">Rate</span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  step={0.05}
                  value={(rate * 100).toFixed(2)}
                  onChange={(e) =>
                    setAllocation(track.id, { annualRate: (e.target.valueAsNumber || 0) / 100 })
                  }
                  className="w-20 rounded-lg border border-warm-border px-2 py-1.5 text-navy outline-none transition-colors focus:border-sky-accent"
                />
                <span className="text-navy-mid/50">%</span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
