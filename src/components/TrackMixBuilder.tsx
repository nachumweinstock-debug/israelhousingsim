import type { Mix } from "../types";
import { DEFAULT_TRACKS, getTrack } from "../engine/tracks";
import { RULE_SET } from "../engine/rules";
import { computeShares, getTrack as getTrackFromValidation } from "../engine/validation";
import { allocationTotal } from "../engine/mix";
import { formatPercent } from "../engine/format";
import { Badge } from "./ui/Badge";

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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
            totalOk ? "border-good/30 bg-good/10 text-good" : "border-warn/30 bg-warn/10 text-warn"
          }`}
        >
          Allocated: {total.toFixed(0)}% {totalOk ? "" : "(should total 100%)"}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-navy-mid/70">Fixed share</span>
          <Badge status={fixedOk ? "pass" : "fail"} />
          <span className="font-medium text-navy">{formatPercent(fixedShare)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-navy-mid/70">Variable share</span>
          <Badge status={variableOk ? "pass" : "fail"} />
          <span className="font-medium text-navy">{formatPercent(variableShare)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {DEFAULT_TRACKS.map((track) => {
          const alloc = mix.allocations.find((a) => a.trackId === track.id);
          const percent = alloc?.percent ?? 0;
          const rate = alloc?.annualRate ?? track.defaultAnnualRate;
          return (
            <div
              key={track.id}
              className="grid grid-cols-1 items-center gap-3 rounded-lg border border-warm-border bg-white p-3 sm:grid-cols-[1fr_auto_auto]"
            >
              <div>
                <div className="font-medium text-navy">{track.name}</div>
                <div className="text-xs text-navy-mid/70" dir="rtl">
                  {track.nameHe}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-navy-mid/70">Allocation</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={percent}
                  onChange={(e) => setAllocation(track.id, { percent: e.target.valueAsNumber || 0 })}
                  className="w-20 rounded-md border border-warm-border px-2 py-1 text-navy outline-none focus:border-sky-accent"
                />
                <span className="text-navy-mid/70">%</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-navy-mid/70">Rate</span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  step={0.05}
                  value={(rate * 100).toFixed(2)}
                  onChange={(e) =>
                    setAllocation(track.id, { annualRate: (e.target.valueAsNumber || 0) / 100 })
                  }
                  className="w-20 rounded-md border border-warm-border px-2 py-1 text-navy outline-none focus:border-sky-accent"
                />
                <span className="text-navy-mid/70">%</span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
