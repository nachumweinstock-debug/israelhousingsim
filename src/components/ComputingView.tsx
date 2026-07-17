import { useEffect, useState } from "react";
import { useLang } from "../i18n";
import { CitySkyline } from "./CitySkyline";

/**
 * Brief "running your numbers" interlude between finishing the wizard and
 * landing on Results — the vibes-style skyline scene with cycling status
 * messages. The calculation itself is instant; this beat exists so the
 * reveal reads as earned, matching vryfid-demo's AnalyzingView pacing.
 */
export function ComputingView() {
  const { t } = useLang();
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setMsgIdx((i) => Math.min(i + 1, t.computing.length - 1)), 800);
    return () => clearInterval(timer);
  }, [t.computing.length]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#07051A] px-6">
      <CitySkyline className="w-full max-w-md rounded-2xl shadow-[0_0_60px_rgba(13,148,136,0.08),0_2px_8px_rgba(0,0,0,0.4)]" />
      <p
        key={msgIdx}
        className="font-serif text-xl italic text-white/85 mb-reveal"
      >
        {t.computing[msgIdx]}
      </p>
      <div className="flex items-center gap-2">
        {t.computing.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i <= msgIdx ? "w-6 bg-[#5EEAD4]" : "w-2 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
