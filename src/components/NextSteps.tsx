import type { BorrowerProfile, MixResult } from "../types";
import { RULE_SET } from "../engine/rules";
import { formatCurrency, formatPercent } from "../engine/format";
import { fmt, useLang } from "../i18n";
import { ShareLinks } from "./ShareLinks";
import { softCardBorder, softCardGradient, softCardShadow } from "../styles/brand";

interface Issue {
  severity: "fail" | "warn";
  text: string;
}

/**
 * Personalized action items derived from the user's actual check results —
 * each failed or warned check becomes a concrete instruction with computed
 * amounts (e.g. the exact equity shortfall in shekels), not a generic tip.
 */
function buildIssues(result: MixResult, profile: BorrowerProfile, t: ReturnType<typeof useLang>["t"]): Issue[] {
  const issues: Issue[] = [];

  for (const check of result.checks) {
    if (check.status === "pass") continue;

    if (check.id === "ltv" && check.status === "fail") {
      const minEquity = profile.propertyPrice * (1 - check.limit);
      issues.push({
        severity: "fail",
        text: fmt(t.nextSteps.issues.ltv_fail, {
          cap: formatPercent(check.limit),
          minEquity: formatCurrency(minEquity),
          equity: formatCurrency(profile.ownEquity),
        }),
      });
    } else if (check.id === "pti") {
      issues.push({
        severity: check.status,
        text: fmt(check.status === "fail" ? t.nextSteps.issues.pti_fail : t.nextSteps.issues.pti_warn, {
          pti: formatPercent(check.value),
        }),
      });
    } else if (check.id === "fixed_share" && check.status === "fail") {
      issues.push({
        severity: "fail",
        text: fmt(t.nextSteps.issues.fixed_fail, { fixed: formatPercent(check.value) }),
      });
    } else if (check.id === "variable_share" && check.status === "fail") {
      issues.push({
        severity: "fail",
        text: fmt(t.nextSteps.issues.variable_fail, { variable: formatPercent(check.value) }),
      });
    } else if (check.id === "term" && check.status === "warn") {
      issues.push({
        severity: "warn",
        text: fmt(t.nextSteps.issues.term_warn, {
          requested: check.value,
          effective: check.limit,
          maxAge: RULE_SET.maxAgeAtPayoff,
        }),
      });
    }
  }

  const ratio = result.paymentToday > 0 ? result.paymentStressed / result.paymentToday : 1;
  if (ratio > 1.25) {
    issues.push({
      severity: "warn",
      text: fmt(t.nextSteps.issues.stress_gap, { pct: formatPercent(ratio - 1) }),
    });
  }

  // Fails before warnings — fix blockers first.
  return issues.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "fail" ? -1 : 1));
}

export function NextSteps({ result, profile }: { result: MixResult; profile: BorrowerProfile }) {
  const { t } = useLang();
  const issues = buildIssues(result, profile, t);

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: softCardGradient, border: softCardBorder, boxShadow: softCardShadow }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/45">
        {t.nextSteps.eyebrow}
      </p>
      <h3 className="mt-1 font-serif text-xl text-navy">{t.nextSteps.title}</h3>

      {issues.length > 0 ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-navy">{t.nextSteps.issuesTitle}</p>
          <div className="mt-2 space-y-2">
            {issues.map((issue, i) => (
              <div
                key={i}
                className="rounded-xl border-s-4 bg-white px-4 py-3 text-sm leading-relaxed text-navy-mid/85"
                style={{
                  borderColor: issue.severity === "fail" ? "#C53030" : "#B7791F",
                  boxShadow: softCardShadow,
                }}
              >
                {issue.text}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-3 rounded-xl border-s-4 border-good bg-white px-4 py-3 text-sm leading-relaxed text-navy-mid/85">
          {t.nextSteps.readyLine}
        </p>
      )}

      <p className="mt-5 text-sm font-semibold text-navy">{t.nextSteps.standardPath}</p>
      <ol className="mt-3 space-y-4">
        {t.nextSteps.steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-navy font-serif text-sm text-cream">
              {i + 1}
            </span>
            <div>
              <p className="font-semibold text-navy">{step.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-navy-mid/75">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <ShareLinks placement="next_steps" className="mt-5 justify-start" />
      <p className="mt-4 text-xs text-navy-mid/50">{t.nextSteps.disclaimer}</p>
    </div>
  );
}
