import type { Assumptions, BorrowerProfile, Mix, MixResult } from "../types";
import { getTrack } from "../engine/tracks";
import { RULE_SET } from "../engine/rules";
import { formatCurrency, formatPercent } from "../engine/format";
import { fmt, useLang } from "../i18n";

/**
 * Print-only summary document (hidden on screen, becomes the page in
 * @media print via Tailwind's print: variants). Field labels are
 * deliberately bilingual regardless of UI language — this sheet is meant
 * to be handed to an Israeli bank officer or advisor, who works in Hebrew,
 * by a user who may work in English.
 */
function Row({ en, he, value }: { en: string; he: string; value: string }) {
  return (
    <tr className="border-b border-gray-200">
      <td className="py-1 pe-4 text-sm text-gray-600">
        {en} · <span dir="rtl">{he}</span>
      </td>
      <td className="py-1 text-sm font-semibold text-black" dir="ltr">
        {value}
      </td>
    </tr>
  );
}

const CATEGORY_HE: Record<string, string> = {
  first_home: "דירה ראשונה",
  replacement_home: "דירה חלופית",
  investment: "השקעה / דירה נוספת",
  foreign_resident: "תושב חוץ",
  oleh_chadash: "עולה חדש",
};

export function PrintSummary({
  profile,
  mix,
  result,
  assumptions,
}: {
  profile: BorrowerProfile;
  mix: Mix;
  result: MixResult;
  assumptions: Assumptions;
}) {
  const { t } = useLang();
  const date = new Date().toLocaleDateString("en-GB");

  return (
    <div className="hidden bg-white p-8 text-black print:block">
      <h1 className="font-serif text-2xl">{t.printDoc.title}</h1>
      <p className="mt-1 text-xs text-gray-500">{fmt(t.printDoc.generated, { date })}</p>

      <h2 className="mt-6 font-serif text-lg">{t.printDoc.profileTitle}</h2>
      <table className="mt-2 w-full">
        <tbody>
          <Row en="Property price" he="מחיר הנכס" value={formatCurrency(profile.propertyPrice)} />
          <Row en="Own equity" he="הון עצמי" value={formatCurrency(profile.ownEquity)} />
          <Row en="Loan amount" he="סכום ההלוואה" value={`${formatCurrency(result.loanAmount)} (LTV ${formatPercent(result.ltv)})`} />
          <Row
            en="Buyer category"
            he="קטגוריית רוכש"
            value={`${t.wizard.categoryOptions[profile.buyerCategory].label} / ${CATEGORY_HE[profile.buyerCategory]}`}
          />
          <Row en="Monthly net income" he="הכנסה נטו חודשית" value={formatCurrency(profile.monthlyNetIncome)} />
          <Row en="Existing monthly debt" he="החזר חודשי קיים" value={formatCurrency(profile.existingMonthlyDebt)} />
          <Row
            en="Term (effective)"
            he="תקופה אפקטיבית"
            value={`${result.effectiveTermYears} yrs (requested ${profile.requestedTermYears})`}
          />
          <Row en="Age of older borrower" he="גיל הלווה המבוגר" value={`${profile.olderBorrowerAge}`} />
        </tbody>
      </table>

      <h2 className="mt-6 font-serif text-lg">{t.printDoc.mixTitle}</h2>
      <table className="mt-2 w-full">
        <thead>
          <tr className="border-b border-gray-400 text-start text-xs uppercase text-gray-500">
            <th className="py-1 text-start">Track · מסלול</th>
            <th className="py-1 text-start">%</th>
            <th className="py-1 text-start">Rate · ריבית</th>
            <th className="py-1 text-start">Amount · סכום</th>
          </tr>
        </thead>
        <tbody>
          {mix.allocations
            .filter((a) => a.percent > 0)
            .map((alloc) => {
              const track = getTrack(alloc.trackId);
              return (
                <tr key={alloc.trackId} className="border-b border-gray-200">
                  <td className="py-1 pe-3 text-sm">
                    {track.name} · <span dir="rtl">{track.nameHe}</span>
                  </td>
                  <td className="py-1 text-sm" dir="ltr">{alloc.percent}%</td>
                  <td className="py-1 text-sm" dir="ltr">{(alloc.annualRate * 100).toFixed(2)}%</td>
                  <td className="py-1 text-sm" dir="ltr">
                    {formatCurrency(result.loanAmount * (alloc.percent / 100))}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      <h2 className="mt-6 font-serif text-lg">{t.printDoc.resultsTitle}</h2>
      <table className="mt-2 w-full">
        <tbody>
          <Row en="Payment today" he="החזר היום" value={`${formatCurrency(result.paymentToday)}/mo`} />
          <Row en="Highest expected payment" he="החזר צפוי מקסימלי" value={`${formatCurrency(result.paymentStressed)}/mo`} />
          <Row
            en="Total interest (stress / baseline)"
            he="סך ריבית (קיצון / בסיס)"
            value={`${formatCurrency(result.totalInterestStressed)} / ${formatCurrency(result.totalInterestBaseline)}`}
          />
          <Row en="Payment-to-income" he="יחס החזר מהכנסה" value={formatPercent(result.pti)} />
          <Row en="Fixed share" he="רכיב קבוע" value={formatPercent(result.fixedShare)} />
        </tbody>
      </table>

      <h2 className="mt-6 font-serif text-lg">
        Regulatory checks · <span dir="rtl">בדיקות רגולציה</span>
      </h2>
      <table className="mt-2 w-full">
        <tbody>
          {result.checks.map((check) => (
            <tr key={check.id} className="border-b border-gray-200">
              <td className="py-1 pe-4 text-sm text-gray-600">
                {(t.checks.labels as Record<string, string>)[check.id] ?? check.label}
              </td>
              <td className="py-1 text-sm font-bold uppercase" dir="ltr">
                {check.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4 text-xs text-gray-500" dir="ltr">
        {fmt(t.printDoc.assumptionsLine, {
          cpi: formatPercent(assumptions.cpiAnnual, 1),
          shock: assumptions.stressShockPoints,
        })}
        {" · "}
        {fmt(t.common.disclaimer, { date: RULE_SET.effectiveDate })}
      </p>
    </div>
  );
}
