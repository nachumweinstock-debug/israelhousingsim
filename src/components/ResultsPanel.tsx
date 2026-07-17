import type { MixResult, RegulatoryCheck } from "../types";
import { formatCurrency, formatPercent } from "../engine/format";
import { getTrack } from "../engine/tracks";
import { RULE_SET } from "../engine/rules";
import { fmt, useLang, type Strings } from "../i18n";
import { Badge } from "./ui/Badge";
import { HealthPanel } from "./HealthPanel";
import { revealDelay, softCardBorder, softCardGradient, softCardShadow } from "../styles/brand";

/**
 * Localized check explanations are rendered here from i18n templates, keyed
 * by check id + status, instead of using the engine's built-in English
 * sentences — the engine stays language-agnostic, the UI owns the words.
 */
function checkExplanation(check: RegulatoryCheck, t: Strings): string {
  const pct = (v: number) => formatPercent(v);
  switch (check.id) {
    case "ltv":
      return fmt(t.checks.ltv[check.status === "fail" ? "fail" : "pass"], {
        value: pct(check.value),
        limit: pct(check.limit),
      });
    case "pti":
      return fmt(t.checks.pti[check.status], {
        value: pct(check.value),
        limit: pct(check.limit),
        caution: pct(RULE_SET.ptiCautionFloor),
      });
    case "fixed_share":
      return fmt(t.checks.fixed_share[check.status === "fail" ? "fail" : "pass"], {
        value: pct(check.value),
        limit: pct(check.limit),
      });
    case "variable_share":
      return fmt(t.checks.variable_share[check.status === "fail" ? "fail" : "pass"], {
        value: pct(check.value),
        limit: pct(check.limit),
      });
    case "term":
      return fmt(t.checks.term[check.status === "warn" ? "warn" : "pass"], {
        requested: check.value,
        effective: check.limit,
        maxTerm: RULE_SET.maxTermYears,
        maxAge: RULE_SET.maxAgeAtPayoff,
      });
    default:
      return check.explanation;
  }
}

function checkLabel(check: RegulatoryCheck, t: Strings): string {
  const labels = t.checks.labels as Record<string, string>;
  return labels[check.id] ?? check.label;
}

function StatCard({
  label,
  value,
  index = 0,
}: {
  label: string;
  value: string;
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
      <div className="mt-1.5 font-serif text-3xl tabular-nums text-navy">{value}</div>
    </div>
  );
}

export function ResultsPanel({ result }: { result: MixResult }) {
  const { t, lang } = useLang();
  return (
    <div className="space-y-6">
      <HealthPanel result={result} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label={t.results.ltvShort} value={formatPercent(result.ltv)} index={0} />
        <StatCard label={t.results.ptiShort} value={formatPercent(result.pti)} index={1} />
        <StatCard label={t.results.fixedShareLabel} value={formatPercent(result.fixedShare)} index={2} />
        <StatCard
          label={t.results.effectiveTermLabel}
          value={`${result.effectiveTermYears} ${t.results.yrsSuffix}`}
          index={3}
        />
      </div>

      <div
        className="rounded-2xl p-5"
        style={{ background: "white", border: softCardBorder, boxShadow: softCardShadow }}
      >
        <h3 className="font-serif text-xl text-navy">{t.results.checksTitle}</h3>
        <div className="mt-3 space-y-3">
          {result.checks.map((check) => (
            <div
              key={check.id}
              className="flex flex-col gap-1.5 border-b border-warm-border/60 pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-navy">{checkLabel(check, t)}</span>
                <Badge status={check.status} />
              </div>
              <p className="text-sm leading-relaxed text-navy-mid/75">{checkExplanation(check, t)}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl p-5"
        style={{ background: "white", border: softCardBorder, boxShadow: softCardShadow }}
      >
        <h3 className="font-serif text-xl text-navy">{t.results.byTrack}</h3>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full min-w-[480px] text-start text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.14em] text-navy/40">
                <th className="pb-2 text-start">{t.wizard.trackCol}</th>
                <th className="pb-2 text-start">{t.results.paymentToday}</th>
                <th className="pb-2 text-start">{t.results.highestExpected}</th>
                <th className="pb-2 text-start">{t.results.totalInterestCol}</th>
              </tr>
            </thead>
            <tbody>
              {result.trackResults
                .filter((r) => r.allocationAmount > 0)
                .map((r) => {
                  const track = getTrack(r.trackId);
                  return (
                    <tr key={r.trackId} className="border-t border-warm-border/60">
                      <td className="py-2.5 pe-2 font-medium text-navy">
                        {lang === "he" ? track.nameHe : track.name}
                      </td>
                      <td className="py-2.5 tabular-nums text-navy-mid/80">
                        {formatCurrency(r.paymentToday)}
                      </td>
                      <td className="py-2.5 tabular-nums text-navy-mid/80">
                        {formatCurrency(r.paymentStressed)}
                      </td>
                      <td className="py-2.5 tabular-nums text-navy-mid/80">
                        {formatCurrency(r.totalInterestStressed)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-navy-mid/50">{t.results.simplifiedNote}</p>
    </div>
  );
}
