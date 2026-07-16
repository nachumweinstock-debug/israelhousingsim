import type { CheckStatus } from "../../types";

const STYLES: Record<CheckStatus, string> = {
  pass: "bg-good/10 text-good border-good/25",
  warn: "bg-warn/10 text-warn border-warn/25",
  fail: "bg-bad/10 text-bad border-bad/25",
};

const TEXT: Record<CheckStatus, string> = {
  pass: "Pass",
  warn: "Caution",
  fail: "Fail",
};

/** Every badge carries a text equivalent alongside color — color alone
 * should never be the only signal (section 9, accessibility). */
export function Badge({ status }: { status: CheckStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${STYLES[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "pass" ? "bg-good" : status === "warn" ? "bg-warn" : "bg-bad"
        }`}
        style={{
          boxShadow: `0 0 6px ${status === "pass" ? "#2F855A" : status === "warn" ? "#B7791F" : "#C53030"}88`,
        }}
        aria-hidden
      />
      {TEXT[status]}
    </span>
  );
}
