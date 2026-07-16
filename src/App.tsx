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

type TabId = "profile" | "mix" | "assumptions" | "results" | "comparison";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "profile", label: "Profile" },
  { id: "mix", label: "Track Mix" },
  { id: "assumptions", label: "Assumptions" },
  { id: "results", label: "Results" },
  { id: "comparison", label: "Comparison" },
];

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
      <header className="border-b border-warm-border bg-cream px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-serif text-3xl text-navy sm:text-4xl">Mashkanta Mix Simulator</h1>
          <p className="mt-1 text-sm text-navy-mid/80">
            See your mortgage the way the bank sees it, before you walk in.
          </p>
        </div>
      </header>

      <nav className="sticky top-0 z-10 border-b border-warm-border bg-cream/95 backdrop-blur px-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto py-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-navy text-cream"
                  : "text-navy-mid/80 hover:bg-warm-gray"
              }`}
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={resetAll}
            className="ml-auto whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-navy-mid/60 hover:bg-warm-gray"
          >
            Reset
          </button>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-8">
        {tab === "profile" && (
          <section>
            <h2 className="mb-5 font-serif text-2xl text-navy">Your profile</h2>
            <ProfileForm profile={profile} onChange={setProfile} />
          </section>
        )}
        {tab === "mix" && (
          <section>
            <h2 className="mb-5 font-serif text-2xl text-navy">Build your track mix</h2>
            <TrackMixBuilder mix={mix} onChange={setMix} />
          </section>
        )}
        {tab === "assumptions" && (
          <section>
            <h2 className="mb-5 font-serif text-2xl text-navy">Assumptions</h2>
            <AssumptionsPanel assumptions={assumptions} onChange={setAssumptions} />
          </section>
        )}
        {tab === "results" && (
          <section>
            <h2 className="mb-5 font-serif text-2xl text-navy">Results</h2>
            <ResultsPanel result={result} />
          </section>
        )}
        {tab === "comparison" && (
          <section>
            <h2 className="mb-5 font-serif text-2xl text-navy">Your mix vs. the official baskets</h2>
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
