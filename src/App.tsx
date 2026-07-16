import { useMemo, useState } from "react";
import { ProfileForm } from "./components/ProfileForm";
import { TrackMixBuilder } from "./components/TrackMixBuilder";
import { AssumptionsPanel } from "./components/AssumptionsPanel";
import { ResultsPanel } from "./components/ResultsPanel";
import { ComparisonPanel } from "./components/ComparisonPanel";
import { Disclaimer } from "./components/ui/Disclaimer";
import { useSimulatorState } from "./state/useSimulatorState";
import { computeMixResult } from "./engine/mix";
import { RULE_SET } from "./engine/rules";
import { heroGradient } from "./styles/brand";

type TabId = "profile" | "mix" | "assumptions" | "results" | "comparison";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "profile", label: "Profile" },
  { id: "mix", label: "Track Mix" },
  { id: "assumptions", label: "Assumptions" },
  { id: "results", label: "Results" },
  { id: "comparison", label: "Comparison" },
];

const HERO_STATS: Array<[string, string]> = [
  ["5", "loan tracks"],
  ["3", "official baskets"],
  ["30yr", "max term"],
];

function Hero() {
  return (
    <div className="relative overflow-hidden" style={{ background: heroGradient }}>
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/3 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(93,155,230,0.14) 0%, transparent 68%)" }}
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/2 h-[320px] w-[320px] -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(59,108,196,0.16) 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-14 text-center sm:px-8 sm:py-20">
        <div className="mb-6 inline-flex items-center justify-center gap-2.5 mb-reveal">
          <span className="h-px w-8 bg-white/15" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-accent">
            Educational Mortgage Planning
          </span>
          <span className="h-px w-8 bg-white/15" />
        </div>

        <h1
          className="mb-5 font-serif leading-[1.08] text-white mb-reveal"
          style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", animationDelay: "0.06s" }}
        >
          See your mortgage
          <br />
          <em className="not-italic" style={{ color: "#BFDBFE" }}>
            the way the bank sees it.
          </em>
        </h1>

        <p
          className="mx-auto mb-10 max-w-lg text-base font-light leading-relaxed text-white/55 mb-reveal"
          style={{ animationDelay: "0.12s" }}
        >
          Build your own mashkanta mix, check it against the limits that apply to you, and compare
          it to the three baskets every bank is required to quote — before you walk into a branch.
        </p>

        <div
          className="flex justify-center gap-10 border-t pt-6 mb-reveal"
          style={{ borderColor: "rgba(255,255,255,0.08)", animationDelay: "0.18s" }}
        >
          {HERO_STATS.map(([value, label]) => (
            <div key={label} className="text-center">
              <p className="font-serif text-2xl tracking-tight text-white">{value}</p>
              <p className="mt-1 text-xs tracking-wide text-white/30">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const { profile, setProfile, mix, setMix, assumptions, setAssumptions, resetAll } =
    useSimulatorState();
  const [tab, setTab] = useState<TabId>("profile");

  const result = useMemo(
    () => computeMixResult(mix, profile, assumptions, RULE_SET),
    [mix, profile, assumptions]
  );

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Hero />

      <nav className="sticky top-0 z-10 border-b border-warm-border bg-cream/90 px-4 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
          <div className="flex items-center gap-1 rounded-full border border-warm-border bg-white p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
                  tab === t.id
                    ? "bg-navy text-cream shadow-[0_4px_14px_rgba(27,58,107,0.35)]"
                    : "text-navy-mid/70 hover:bg-warm-gray/70"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button
            onClick={resetAll}
            className="ml-auto whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-navy-mid/50 transition-colors hover:text-navy"
          >
            Reset
          </button>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-8">
        {tab === "profile" && (
          <section key="profile" className="mb-reveal">
            <h2 className="mb-6 font-serif text-2xl text-navy">Your profile</h2>
            <ProfileForm profile={profile} onChange={setProfile} />
          </section>
        )}
        {tab === "mix" && (
          <section key="mix" className="mb-reveal">
            <h2 className="mb-6 font-serif text-2xl text-navy">Build your track mix</h2>
            <TrackMixBuilder mix={mix} onChange={setMix} />
          </section>
        )}
        {tab === "assumptions" && (
          <section key="assumptions" className="mb-reveal">
            <h2 className="mb-6 font-serif text-2xl text-navy">Assumptions</h2>
            <AssumptionsPanel assumptions={assumptions} onChange={setAssumptions} />
          </section>
        )}
        {tab === "results" && (
          <section key="results" className="mb-reveal">
            <h2 className="mb-6 font-serif text-2xl text-navy">Results</h2>
            <ResultsPanel result={result} />
          </section>
        )}
        {tab === "comparison" && (
          <section key="comparison" className="mb-reveal">
            <h2 className="mb-6 font-serif text-2xl text-navy">Your mix vs. the official baskets</h2>
            <ComparisonPanel
              userMixResult={result}
              profile={profile}
              assumptions={assumptions}
              ruleSet={RULE_SET}
            />
          </section>
        )}
      </main>

      <Disclaimer />
    </div>
  );
}

export default App;
