import type { Assumptions, BorrowerProfile, Mix, MixResult, RegulatoryCheck } from "../types";
import { getTrack } from "../engine/tracks";
import { RULE_SET } from "../engine/rules";
import { formatCurrency, formatPercent } from "../engine/format";
import { fmt, STRINGS, type Lang } from "../i18n";

export type PrintMode = Lang | "both";

const CATEGORY_LABELS: Record<Lang, Record<string, string>> = {
  en: {
    first_home: "First home",
    replacement_home: "Replacement home",
    investment: "Investment / additional home",
    foreign_resident: "Foreign resident",
    oleh_chadash: "Oleh chadash",
  },
  he: {
    first_home: "דירה ראשונה",
    replacement_home: "דירה חלופית",
    investment: "השקעה / דירה נוספת",
    foreign_resident: "תושב חוץ",
    oleh_chadash: "עולה חדש",
  },
};

type CopyShape = {
  title: string;
  subtitle: string;
  generated: string;
  profileTitle: string;
  mixTitle: string;
  resultsTitle: string;
  checksTitle: string;
  tracks: string[];
  labels: Record<string, string>;
  footer: string;
};

const COPY: Record<Lang, CopyShape> = {
  en: {
    title: "VryfID Mortgage Readiness Check",
    subtitle: "Do I qualify for a mortgage?",
    generated: "Generated {date} by VryfID",
    profileTitle: "Borrower profile",
    mixTitle: "Requested loan mix",
    resultsTitle: "Approval indicators",
    checksTitle: "Bank-style checks",
    tracks: ["Track", "Share", "Rate", "Amount"],
    labels: {
      propertyPrice: "Property price",
      ownEquity: "Own equity",
      loanAmount: "Loan amount",
      buyerCategory: "Buyer category",
      income: "Monthly net income",
      debt: "Existing monthly debt",
      age: "Age of older borrower",
      term: "Term, effective / requested",
      paymentToday: "Payment today",
      highestExpected: "Highest expected payment",
      totalInterest: "Total interest, stress / baseline",
      pti: "Payment-to-income",
      fixedShare: "Fixed share",
      assumptions: "Assumptions",
    },
    footer:
      "Educational mortgage readiness report. This is not a bank quote. Confirm all figures with a licensed bank or mortgage advisor.",
  },
  he: {
    title: "בדיקת מוכנות למשכנתא של VryfID",
    subtitle: "האם המשכנתא שלי יכולה לעבור בנק?",
    generated: "הופק {date} על ידי VryfID",
    profileTitle: "פרופיל הלווה",
    mixTitle: "תמהיל ההלוואה המבוקש",
    resultsTitle: "מדדי אישור",
    checksTitle: "בדיקות בסגנון בנקאי",
    tracks: ["מסלול", "נתח", "ריבית", "סכום"],
    labels: {
      propertyPrice: "מחיר הנכס",
      ownEquity: "הון עצמי",
      loanAmount: "סכום ההלוואה",
      buyerCategory: "קטגוריית רוכש",
      income: "הכנסה נטו חודשית",
      debt: "החזר חוב חודשי קיים",
      age: "גיל הלווה המבוגר",
      term: "תקופה, אפקטיבית / מבוקשת",
      paymentToday: "החזר היום",
      highestExpected: "החזר צפוי מקסימלי",
      totalInterest: "סך ריבית, קיצון / בסיס",
      pti: "יחס החזר מהכנסה",
      fixedShare: "רכיב קבוע",
      assumptions: "הנחות",
    },
    footer:
      "דוח מוכנות לימודי למשכנתא. זו אינה הצעת מחיר מבנק. אמתו את כל הנתונים מול בנק או יועץ משכנתאות מורשה.",
  },
};

function Row({ label, value, dir }: { label: string; value: string; dir: "ltr" | "rtl" }) {
  return (
    <tr className="border-b border-gray-200">
      <td className="py-1.5 pe-4 text-sm text-gray-600">{label}</td>
      <td className="py-1.5 text-sm font-semibold text-black" dir={dir === "rtl" ? "rtl" : "ltr"}>
        {value}
      </td>
    </tr>
  );
}

function checkStatusLabel(check: RegulatoryCheck, lang: Lang) {
  const labels = STRINGS[lang].badge;
  return labels[check.status];
}

function SummaryPage({
  lang,
  profile,
  mix,
  result,
  assumptions,
  pageBreak,
}: {
  lang: Lang;
  profile: BorrowerProfile;
  mix: Mix;
  result: MixResult;
  assumptions: Assumptions;
  pageBreak?: boolean;
}) {
  const copy = COPY[lang];
  const strings = STRINGS[lang];
  const date = new Date().toLocaleDateString(lang === "he" ? "he-IL" : "en-GB");
  const dir = lang === "he" ? "rtl" : "ltr";

  return (
    <article className={`bg-white p-8 text-black ${pageBreak ? "break-before-page" : ""}`} dir={dir}>
      <header className="border-b-4 border-[#1B3A6B] pb-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <img src="/vryfid-full-logo.jpeg" alt="VryfID" className="h-12 w-auto rounded-md" />
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#5D9BE6]">VryfID Mortgage</p>
          </div>
          <img src="/vryfid-logo.jpeg" alt="" className="h-12 w-12 rounded-xl object-cover" aria-hidden="true" />
        </div>
        <h1 className="mt-6 font-serif text-3xl text-[#1B3A6B]">{copy.title}</h1>
        <p className="mt-1 text-lg font-semibold text-gray-700">{copy.subtitle}</p>
        <p className="mt-2 text-xs text-gray-500">{fmt(copy.generated, { date })}</p>
      </header>

      <section className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg border border-gray-200 bg-[#F7FAFF] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">LTV</p>
          <p className="mt-1 font-serif text-2xl text-[#1B3A6B]">{formatPercent(result.ltv)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-[#F7FAFF] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">PTI</p>
          <p className="mt-1 font-serif text-2xl text-[#1B3A6B]">{formatPercent(result.pti)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-[#F7FAFF] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            {strings.results.effectiveTermLabel}
          </p>
          <p className="mt-1 font-serif text-2xl text-[#1B3A6B]">{result.effectiveTermYears}</p>
        </div>
      </section>

      <h2 className="mt-6 font-serif text-lg text-[#1B3A6B]">{copy.profileTitle}</h2>
      <table className="mt-2 w-full">
        <tbody>
          <Row label={copy.labels.propertyPrice} value={formatCurrency(profile.propertyPrice)} dir={dir} />
          <Row label={copy.labels.ownEquity} value={formatCurrency(profile.ownEquity)} dir={dir} />
          <Row
            label={copy.labels.loanAmount}
            value={`${formatCurrency(result.loanAmount)} (${formatPercent(result.ltv)} LTV)`}
            dir={dir}
          />
          <Row
            label={copy.labels.buyerCategory}
            value={CATEGORY_LABELS[lang][profile.buyerCategory]}
            dir={dir}
          />
          <Row label={copy.labels.income} value={formatCurrency(profile.monthlyNetIncome)} dir={dir} />
          <Row label={copy.labels.debt} value={formatCurrency(profile.existingMonthlyDebt)} dir={dir} />
          <Row label={copy.labels.age} value={`${profile.olderBorrowerAge}`} dir={dir} />
          <Row
            label={copy.labels.term}
            value={`${result.effectiveTermYears} / ${profile.requestedTermYears}`}
            dir={dir}
          />
        </tbody>
      </table>

      <h2 className="mt-6 font-serif text-lg text-[#1B3A6B]">{copy.mixTitle}</h2>
      <table className="mt-2 w-full">
        <thead>
          <tr className="border-b border-gray-400 text-start text-xs uppercase text-gray-500">
            {copy.tracks.map((heading) => (
              <th key={heading} className="py-1 text-start">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mix.allocations
            .filter((a) => a.percent > 0)
            .map((alloc) => {
              const track = getTrack(alloc.trackId);
              return (
                <tr key={alloc.trackId} className="border-b border-gray-200">
                  <td className="py-1.5 pe-3 text-sm">{lang === "he" ? track.nameHe : track.name}</td>
                  <td className="py-1.5 text-sm" dir="ltr">{alloc.percent}%</td>
                  <td className="py-1.5 text-sm" dir="ltr">{(alloc.annualRate * 100).toFixed(2)}%</td>
                  <td className="py-1.5 text-sm" dir="ltr">
                    {formatCurrency(result.loanAmount * (alloc.percent / 100))}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      <h2 className="mt-6 font-serif text-lg text-[#1B3A6B]">{copy.resultsTitle}</h2>
      <table className="mt-2 w-full">
        <tbody>
          <Row label={copy.labels.paymentToday} value={`${formatCurrency(result.paymentToday)}/mo`} dir={dir} />
          <Row
            label={copy.labels.highestExpected}
            value={`${formatCurrency(result.paymentStressed)}/mo`}
            dir={dir}
          />
          <Row
            label={copy.labels.totalInterest}
            value={`${formatCurrency(result.totalInterestStressed)} / ${formatCurrency(result.totalInterestBaseline)}`}
            dir={dir}
          />
          <Row label={copy.labels.pti} value={formatPercent(result.pti)} dir={dir} />
          <Row label={copy.labels.fixedShare} value={formatPercent(result.fixedShare)} dir={dir} />
          <Row
            label={copy.labels.assumptions}
            value={`CPI ${formatPercent(assumptions.cpiAnnual, 1)} / +${assumptions.stressShockPoints}pp`}
            dir={dir}
          />
        </tbody>
      </table>

      <h2 className="mt-6 font-serif text-lg text-[#1B3A6B]">{copy.checksTitle}</h2>
      <table className="mt-2 w-full">
        <tbody>
          {result.checks.map((check) => (
            <tr key={check.id} className="border-b border-gray-200">
              <td className="py-1.5 pe-4 text-sm text-gray-600">
                {(strings.checks.labels as Record<string, string>)[check.id] ?? check.label}
              </td>
              <td className="py-1.5 text-sm font-bold uppercase text-[#1B3A6B]">{checkStatusLabel(check, lang)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer className="mt-8 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between gap-4">
          <p className="max-w-xl text-xs leading-relaxed text-gray-500">{copy.footer}</p>
          <p className="text-xs font-semibold text-[#1B3A6B]" dir="ltr">
            vryfid.com
          </p>
        </div>
        <p className="mt-2 text-[10px] text-gray-400" dir="ltr">
          Regulatory figures as of {RULE_SET.effectiveDate}
        </p>
      </footer>
    </article>
  );
}

export function PrintSummary({
  profile,
  mix,
  result,
  assumptions,
  mode,
}: {
  profile: BorrowerProfile;
  mix: Mix;
  result: MixResult;
  assumptions: Assumptions;
  mode: PrintMode;
}) {
  const languages: Lang[] = mode === "both" ? ["en", "he"] : [mode];

  return (
    <div className="hidden bg-white print:block">
      {languages.map((lang, index) => (
        <SummaryPage
          key={lang}
          lang={lang}
          profile={profile}
          mix={mix}
          result={result}
          assumptions={assumptions}
          pageBreak={index > 0}
        />
      ))}
    </div>
  );
}
