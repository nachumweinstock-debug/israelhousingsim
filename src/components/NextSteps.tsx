import { useLang } from "../i18n";
import { softCardBorder, softCardGradient, softCardShadow } from "../styles/brand";

/**
 * "What happens now" — concrete, generic guidance on turning a simulated
 * mix into a real mortgage process (pre-approval, competing quotes,
 * documents, deadlines). Deliberately general: this is orientation, not
 * personal financial advice, and the disclaimer line says so.
 */
export function NextSteps() {
  const { t } = useLang();
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: softCardGradient, border: softCardBorder, boxShadow: softCardShadow }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/45">
        {t.nextSteps.eyebrow}
      </p>
      <h3 className="mt-1 font-serif text-xl text-navy">{t.nextSteps.title}</h3>
      <ol className="mt-4 space-y-4">
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
      <p className="mt-4 text-xs text-navy-mid/50">{t.nextSteps.disclaimer}</p>
    </div>
  );
}
