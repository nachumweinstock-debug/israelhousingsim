import type { CheckStatus } from "../../types";
import { useLang } from "../../i18n";

const STYLES: Record<CheckStatus, string> = {
  pass: "bg-good/10 text-good border-good/25",
  warn: "bg-warn/10 text-warn border-warn/25",
  fail: "bg-bad/10 text-bad border-bad/25",
};

const DOT_COLORS: Record<CheckStatus, string> = {
  pass: "#2F855A",
  warn: "#B7791F",
  fail: "#C53030",
};

/** Every badge carries a text equivalent alongside color — color alone
 * should never be the only signal (section 9, accessibility). */
export function Badge({ status }: { status: CheckStatus }) {
  const { t } = useLang();
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${STYLES[status]}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: DOT_COLORS[status], boxShadow: `0 0 6px ${DOT_COLORS[status]}88` }}
        aria-hidden
      />
      {t.badge[status]}
    </span>
  );
}
