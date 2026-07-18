import { useEffect, useState } from "react";
import { useLang } from "../i18n";

/**
 * Brief "running your numbers" interlude between finishing the wizard and
 * landing on Results. The calculation itself is instant; this beat gives
 * the transition a calm, bank-grade pause without changing any numbers.
 */
export function ComputingView() {
  const { t } = useLang();
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setMsgIdx((i) => Math.min(i + 1, t.computing.length - 1)), 800);
    return () => clearInterval(timer);
  }, [t.computing.length]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cream px-6">
      <div className="w-full max-w-sm border-y border-warm-border py-8" aria-hidden="true">
        <div className="flex items-end justify-center gap-3">
          {[44, 68, 92, 58, 78].map((height, i) => (
            <div
              key={height}
              className="w-9 origin-bottom rounded-t-lg bg-sky-accent/70"
              style={{ height, animation: "mb-pulse 1.6s ease-in-out infinite", animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      </div>
      <p
        key={msgIdx}
        className="font-serif text-xl italic text-navy mb-reveal"
      >
        {t.computing[msgIdx]}
      </p>
      <div className="flex items-center gap-2">
        {t.computing.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i <= msgIdx ? "w-6 bg-navy" : "w-2 bg-warm-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
