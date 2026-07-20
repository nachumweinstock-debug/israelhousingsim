import { useState } from "react";
import { motion } from "framer-motion";
import { ContinueButton, QuestionShell, Reveal } from "../components/QuestionShell";
import { isValidIsraeliId } from "../lib/mortgageMath";
import { fmt } from "../i18n";
import { useSimulatorStore } from "../state/simulatorStore";
import { useFlowNav } from "../state/useFlowNav";
import { useSimLang } from "../state/useSimLang";

export function IdentityVerification() {
  const identity = useSimulatorStore((state) => state.identity);
  const setFullName = useSimulatorStore((state) => state.setFullName);
  const setTeudatZehut = useSimulatorStore((state) => state.setTeudatZehut);
  const setIdentityVerified = useSimulatorStore((state) => state.setIdentityVerified);
  const { goNext } = useFlowNav();
  const { s, lang } = useSimLang();
  const [phase, setPhase] = useState<"idle" | "verifying">("idle");
  const [touched, setTouched] = useState(false);

  const idLooksComplete = identity.teudatZehut.trim().length >= 5;
  const idValid = isValidIsraeliId(identity.teudatZehut);
  const canVerify = identity.fullName.trim().length > 1 && idValid;

  function verify() {
    if (!canVerify || phase === "verifying") return;
    setPhase("verifying");
    window.setTimeout(() => {
      setIdentityVerified(new Date().toISOString());
      setPhase("idle");
    }, 900);
  }

  const verifiedDate = identity.verifiedAt
    ? new Date(identity.verifiedAt).toLocaleDateString(lang === "he" ? "he-IL" : "en-GB")
    : null;

  return (
    <QuestionShell
      title={s.identity.title}
      helper={s.identity.helper}
      footer={identity.verified ? <ContinueButton label={s.common.continueLabel} onClick={goNext} /> : null}
    >
      <Reveal className="rounded-3xl border border-hairline bg-card p-6 shadow-lift">
        <label className="block">
          <span className="mb-1.5 block text-[14px] font-semibold text-ink">{s.identity.nameLabel}</span>
          <input
            type="text"
            value={identity.fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={s.identity.namePlaceholder}
            className="w-full rounded-xl border border-hairline bg-cream px-4 py-3 text-[16px] text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-[14px] font-semibold text-ink">{s.identity.idLabel}</span>
          <input
            type="text"
            inputMode="numeric"
            dir="ltr"
            value={identity.teudatZehut}
            onChange={(e) => {
              setTeudatZehut(e.target.value.replace(/[^\d]/g, "").slice(0, 9));
              setTouched(true);
            }}
            placeholder={s.identity.idPlaceholder}
            className="w-full rounded-xl border border-hairline bg-cream px-4 py-3 text-[16px] tabular-nums text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
          {touched && idLooksComplete && !idValid ? (
            <p className="mt-1.5 text-[13px] text-warn">{s.identity.idInvalid}</p>
          ) : null}
        </label>

        <p className="mt-4 text-[12px] leading-relaxed text-inkMuted">{s.identity.methodNote}</p>
      </Reveal>

      <Reveal>
        {identity.verified ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-3xl border border-accent bg-accentSoft/25 px-5 py-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-accent text-white">
              ✓
            </span>
            <p className="text-[14px] font-semibold text-ink">
              {fmt(s.identity.verifiedLabel, { date: verifiedDate ?? "" })}
            </p>
          </motion.div>
        ) : (
          <button
            type="button"
            onClick={verify}
            disabled={!canVerify || phase === "verifying"}
            className={`w-full rounded-pill px-8 py-4 text-[17px] font-semibold transition-colors ${
              !canVerify || phase === "verifying"
                ? "cursor-not-allowed bg-hairline text-inkMuted/60"
                : "bg-accent text-white hover:bg-accentDeep"
            }`}
          >
            {phase === "verifying" ? s.identity.verifying : s.identity.verifyButton}
          </button>
        )}
      </Reveal>
    </QuestionShell>
  );
}
