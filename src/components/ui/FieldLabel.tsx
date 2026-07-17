import { useLang } from "../../i18n";

/**
 * Bilingual field label. The active language's term renders as the primary
 * (large) line and the other language stays visible as the secondary line —
 * users need to recognize the Hebrew term on their actual bank paperwork
 * even when browsing in English, and vice versa.
 */
export function FieldLabel({ label, labelHe }: { label: string; labelHe?: string }) {
  const { lang } = useLang();
  const hebrewPrimary = lang === "he" && !!labelHe;

  const primary = hebrewPrimary ? labelHe : label;
  const secondary = hebrewPrimary ? label : labelHe;

  return (
    <div className="mb-1.5">
      <span
        className={
          hebrewPrimary
            ? "text-base font-semibold text-navy"
            : "text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/50"
        }
        dir={hebrewPrimary ? "rtl" : undefined}
      >
        {primary}
      </span>
      {secondary && (
        <div
          className={
            hebrewPrimary
              ? "mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy/40"
              : "mt-0.5 text-base font-medium text-navy-mid/75"
          }
          dir={hebrewPrimary ? "ltr" : "rtl"}
        >
          {secondary}
        </div>
      )}
    </div>
  );
}
