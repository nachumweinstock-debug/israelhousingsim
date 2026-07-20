import { createPortal } from "react-dom";
import { fmt } from "../i18n";
import type { Lang } from "../i18n";
import { SIM_TEXTS } from "../state/texts";
import { TRACK_INFO, formatPct, formatShekels } from "../lib/mortgageMath";
import type { TrackKey } from "../lib/mortgageMath";
import { buildReportModel } from "../lib/reportModel";
import type { SimulatorAnswers } from "../state/simulatorStore";

export type PrintMode = Lang | "both";

const ACCENT = "#5B9BD5";
const TRACK_KEYS: TrackKey[] = ["prime", "kalatz", "katz"];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-gray-200">
      <td className="py-1.5 pe-4 text-sm text-gray-600">{label}</td>
      <td className="py-1.5 text-sm font-semibold text-black" dir="ltr">
        {value}
      </td>
    </tr>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mt-6 text-lg font-bold" style={{ color: ACCENT }}>
      {children}
    </h2>
  );
}

/**
 * One branded page of the report in a single language. Two of these
 * stack for the bilingual download, with a page break between them.
 */
function ReportPage({
  lang,
  answers,
  pageBreak,
}: {
  lang: Lang;
  answers: SimulatorAnswers;
  pageBreak?: boolean;
}) {
  const s = SIM_TEXTS[lang];
  const p = s.print;
  const dir = lang === "he" ? "rtl" : "ltr";
  const date = new Date().toLocaleDateString(lang === "he" ? "he-IL" : "en-GB");

  const model = buildReportModel(answers, s);
  const {
    loanAmount,
    plan,
    stress1,
    stress2,
    breakdown,
    ltv,
    cashToClose,
    horizonYear,
    paymentAtHorizon,
    dti,
    showsBridgeCaution,
    checks,
    hasFailure,
    stillNeedsLines,
    creditNotes,
  } = model;

  const employmentLabel = {
    salaried: s.incomeDebt.salaried,
    selfEmployed: s.incomeDebt.selfEmployed,
    mixed: s.incomeDebt.mixed,
  }[answers.income.employmentType];

  return (
    <article className={`bg-white p-8 text-black ${pageBreak ? "break-before-page" : ""}`} dir={dir}>
      <header className="pb-5" style={{ borderBottom: `4px solid ${ACCENT}` }}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <img src="/vryfid-full-logo.jpeg" alt="VryfID" className="h-12 w-auto rounded-md" />
            <p
              className="mt-2 text-xs font-semibold uppercase tracking-[0.22em]"
              style={{ color: ACCENT }}
            >
              VryfID Mortgage
            </p>
          </div>
          <img
            src="/vryfid-logo.jpeg"
            alt=""
            className="h-12 w-12 rounded-xl object-cover"
            aria-hidden="true"
          />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-black">{p.title}</h1>
        <p className="mt-1 text-lg font-semibold text-gray-700">{p.subtitle}</p>
        <p className="mt-2 text-xs text-gray-500">{fmt(p.generated, { date })}</p>
      </header>

      <section className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg border border-gray-200 p-3" style={{ background: "#F4F9FE" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            {p.labelsResults.monthlyPayment}
          </p>
          <p className="mt-1 text-2xl font-bold" style={{ color: ACCENT }} dir="ltr">
            {formatShekels(plan.monthlyPayment)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 p-3" style={{ background: "#F4F9FE" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">LTV</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: ACCENT }} dir="ltr">
            {formatPct(ltv)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 p-3" style={{ background: "#F4F9FE" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            {p.labels.dti}
          </p>
          <p className="mt-1 text-2xl font-bold" style={{ color: ACCENT }} dir="ltr">
            {formatPct(dti)}
          </p>
        </div>
      </section>

      {hasFailure ? (
        <div className="mt-4 rounded-lg border-2 p-4" style={{ borderColor: "#C53030", background: "#FFF5F5" }}>
          <p className="text-sm font-bold" style={{ color: "#C53030" }}>
            {s.report.bannerHeading}
          </p>
          <ul className="mt-1.5 space-y-1">
            {checks
              .filter((c) => c.status === "fail")
              .map((c) => (
                <li key={c.id} className="text-xs leading-relaxed text-gray-700">
                  {c.text}
                </li>
              ))}
          </ul>
        </div>
      ) : null}

      <SectionTitle>{p.inputsTitle}</SectionTitle>
      <table className="mt-2 w-full">
        <tbody>
          <Row
            label={p.labels.residency}
            value={answers.residency ? p.residencyValues[answers.residency] : "-"}
          />
          <Row
            label={p.labels.buyerStatus}
            value={answers.buyerStatus ? p.buyerValues[answers.buyerStatus] : "-"}
          />
          {answers.buyerStatus === "replacingHome" && answers.existingHomeStatus ? (
            <Row
              label={p.labels.existingHomeStatus}
              value={s.existingHome[answers.existingHomeStatus].title}
            />
          ) : null}
          <Row label={p.labels.propertyPrice} value={formatShekels(answers.propertyPrice)} />
          <Row label={p.labels.downPayment} value={formatShekels(answers.downPayment)} />
          {answers.downPaymentSource.source ? (
            <Row
              label={p.labels.downPaymentSource}
              value={s.downPaymentSource[answers.downPaymentSource.source].title}
            />
          ) : null}
          <Row
            label={p.labels.loanAmount}
            value={`${formatShekels(loanAmount)} (${formatPct(ltv)} LTV)`}
          />
          <Row label={p.labels.term} value={`${answers.termYears} ${p.yearsUnit}`} />
          <Row label={p.labels.inflation} value={p.inflationValues[answers.inflation]} />
          <Row label={p.labels.income} value={formatShekels(answers.income.applicantIncome)} />
          <Row label={p.labels.employment} value={employmentLabel} />
          <Row
            label={p.labels.tenure}
            value={`${answers.income.employerTenureYears} ${p.yearsUnit}`}
          />
          <Row label={p.labels.debt} value={formatShekels(answers.income.existingMonthlyDebt)} />
          <Row label={p.labels.dti} value={formatPct(dti)} />
        </tbody>
      </table>

      <SectionTitle>{p.mixTitle}</SectionTitle>
      <table className="mt-2 w-full">
        <thead>
          <tr className="border-b border-gray-400 text-xs uppercase text-gray-500">
            {p.trackCols.map((heading) => (
              <th key={heading} className="py-1 text-start">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TRACK_KEYS.filter((key) => answers.mix[key] > 0).map((key) => {
            const perTrack = plan.perTrack.find((t) => t.track === key);
            return (
              <tr key={key} className="border-b border-gray-200">
                <td className="py-1.5 pe-3 text-sm">{s.tracks[key].name}</td>
                <td className="py-1.5 text-sm" dir="ltr">
                  {answers.mix[key]}%
                </td>
                <td className="py-1.5 text-sm" dir="ltr">
                  {(TRACK_INFO[key].annualRate * 100).toFixed(2)}%
                </td>
                <td className="py-1.5 text-sm" dir="ltr">
                  {formatShekels(perTrack?.amount ?? 0)}
                </td>
                <td className="py-1.5 text-sm" dir="ltr">
                  {formatShekels(perTrack?.monthlyPayment ?? 0)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <SectionTitle>{p.resultsTitle}</SectionTitle>
      <table className="mt-2 w-full">
        <tbody>
          <Row
            label={p.labelsResults.monthlyPayment}
            value={`${formatShekels(plan.monthlyPayment)}${s.summary.perMonth}`}
          />
          <Row
            label={fmt(p.labelsResults.paymentYear, { year: horizonYear })}
            value={`${formatShekels(paymentAtHorizon)}${s.summary.perMonth}`}
          />
          <Row label={p.labelsResults.totalInterest} value={formatShekels(plan.totalInterest)} />
          <Row label={p.labelsResults.totalRepayment} value={formatShekels(plan.totalRepayment)} />
          <Row
            label={p.labelsResults.stress1}
            value={`${formatShekels(stress1)}${s.summary.perMonth}`}
          />
          <Row
            label={p.labelsResults.stress2}
            value={`${formatShekels(stress2)}${s.summary.perMonth}`}
          />
        </tbody>
      </table>
      <p className="mt-2 text-xs leading-relaxed text-gray-500">{s.report.rateNoteUnderTable}</p>

      <SectionTitle>{p.costsTitle}</SectionTitle>
      <table className="mt-2 w-full">
        <tbody>
          <Row label={p.labelsCosts.purchaseTax} value={formatShekels(breakdown.purchaseTax)} />
          <Row label={p.labelsCosts.legal} value={formatShekels(breakdown.legalFee)} />
          <Row label={p.labelsCosts.agent} value={formatShekels(breakdown.agentFee)} />
          <Row label={p.labelsCosts.other} value={formatShekels(breakdown.otherFees)} />
          <Row label={p.labelsCosts.costsTotal} value={formatShekels(breakdown.total)} />
          <Row label={p.labelsCosts.cashToClose} value={formatShekels(cashToClose)} />
        </tbody>
      </table>

      {showsBridgeCaution ? (
        <p className="mt-4 rounded-lg border border-gray-200 p-3 text-xs leading-relaxed text-gray-700">
          {s.report.bridgeCaution}
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-6 break-inside-avoid">
        <div>
          <h2 className="text-base font-bold" style={{ color: ACCENT }}>
            {s.report.confirmsTitle}
          </h2>
          <ul className="mt-2 space-y-1.5">
            {checks.map((c) => (
              <li
                key={c.id}
                className="text-xs leading-relaxed"
                style={{ color: c.status === "fail" ? "#C53030" : c.status === "warn" ? "#B7791F" : "#374151" }}
              >
                {c.status === "fail" ? "✕" : c.status === "warn" ? "!" : "✓"} {c.text}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-700">{s.report.stillNeedsTitle}</h2>
          <ul className="mt-2 space-y-1.5">
            {stillNeedsLines.map((line) => (
              <li key={line} className="text-xs leading-relaxed text-gray-600">
                • {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {creditNotes.length > 0 ? (
        <div className="mt-4">
          <h2 className="text-sm font-bold text-gray-700">{s.report.creditNotesTitle}</h2>
          <ul className="mt-1.5 space-y-1">
            {creditNotes.map((line) => (
              <li key={line} className="text-xs leading-relaxed text-gray-600">
                • {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <footer className="mt-8 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between gap-4">
          <p className="max-w-xl text-xs leading-relaxed text-gray-500">{p.footer}</p>
          <p className="text-xs font-semibold" style={{ color: ACCENT }} dir="ltr">
            vryfid.com
          </p>
        </div>
      </footer>
    </article>
  );
}

/**
 * Hidden on screen, becomes the whole document when printing. Rendered
 * through a portal to document.body so the app chrome's print:hidden
 * doesn't swallow it.
 */
export function PrintPlan({ answers, mode }: { answers: SimulatorAnswers; mode: PrintMode }) {
  const languages: Lang[] = mode === "both" ? ["en", "he"] : [mode];
  return createPortal(
    <div className="hidden bg-white print:block">
      {languages.map((lang, index) => (
        <ReportPage key={lang} lang={lang} answers={answers} pageBreak={index > 0} />
      ))}
    </div>,
    document.body
  );
}
