import type { CheckStatus } from "../../types";

const STYLES: Record<CheckStatus, string> = {
  pass: "bg-good/10 text-good border-good/30",
  warn: "bg-warn/10 text-warn border-warn/30",
  fail: "bg-bad/10 text-bad border-bad/30",
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "pass" ? "bg-good" : status === "warn" ? "bg-warn" : "bg-bad"
        }`}
        aria-hidden
      />
      {TEXT[status]}
    </span>
  );
}
