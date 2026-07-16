import { useMemo, useState } from "react";
import { ProfileForm } from "./components/ProfileForm";
import { TrackMixBuilder } from "./components/TrackMixBuilder";
import { AssumptionsPanel } from "./components/AssumptionsPanel";
import { ResultsPanel } from "./components/ResultsPanel";
import { ComparisonPanel } from "./components/ComparisonPanel";
import { NextSteps } from "./components/NextSteps";
import { Disclaimer } from "./components/ui/Disclaimer";
import { LanguageToggle } from "./components/ui/LanguageToggle";
import { VryfIDFooter } from "./components/VryfIDFooter";
import { Wizard } from "./components/Wizard";
import { useSimulatorState } from "./state/useSimulatorState";
import { computeMixResult } from "./engine/mix";
import { RULE_SET } from "./engine/rules";
import { useLang } from "./i18n";
import { heroGradient } from "./styles/brand";

type TabId = "profile" | "mix" | "results" | "comparison";

const TAB_IDS: TabId[] = ["profile", "mix", "results", "comparison"];

function Hero() {
  const { t } = useLang();
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
        <div className="mb-8 flex justify-center mb-reveal">
          <img src="/vryfid-full-logo.jpeg" alt="VryfID" className="h-9 w-auto rounded-md" />
        </div>

        <div
          className="mb-6 inline-flex items-center justify-center gap-2.5 mb-reveal"
          style={{ animationDelay: "0.04s" }}
        >
          <span className="h-px w-8 bg-white/15" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-accent">
            {t.hero.eyebrow}
          </span>
          <span className="h-px w-8 bg-white/15" />
        </div>

        <h1
          className="mb-5 font-serif leading-[1.08] text-white mb-reveal"
          style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", animationDelay: "0.06s" }}
        >
          {t.hero.h1a}
          <br />
          <em className="not-italic" style={{ color: "#BFDBFE" }}>
            {t.hero.h1b}
          </em>
        </h1>

        <p
          className="mx-auto mb-10 max-w-lg text-base font-light leading-relaxed text-white/55 mb-reveal"
          style={{ animationDelay: "0.12s" }}
        >
          {t.hero.sub}
        </p>

        <div
          className="flex justify-center gap-10 border-t pt-6 mb-reveal"
          style={{ borderColor: "rgba(255,255,255,0.08)", animationDelay: "0.18s" }}
        >
          {t.hero.stats.map(([value, label]) => (
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
  const {
    profile,
    setProfile,
    mix,
    setMix,
    assumptions,
    setAssumptions,
    onboarded,
    setOnboarded,
    resetAll,
  } = useSimulatorState();
  const { t } = useLang();
  const [tab, setTab] = useState<TabId>("results");

  const result = useMemo(
    () => computeMixResult(mix, profile, assumptions, RULE_SET),
    [mix, profile, assumptions]
  );

  if (!onboarded) {
    return (
      <>
        <LanguageToggle />
        <Wizard
          profile={profile}
          setProfile={setProfile}
          mix={mix}
          setMix={setMix}
          assumptions={assumptions}
          onComplete={() => {
            setOnboarded(true);
            setTab("results");
          }}
        />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <LanguageToggle />
      <Hero />

      <nav className="sticky top-0 z-10 border-b border-warm-border bg-cream/90 px-4 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
          <div className="flex items-center gap-1 rounded-full border border-warm-border bg-white p-1">
            {TAB_IDS.map((id) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
                  tab === id
                    ? "bg-navy text-cream shadow-[0_4px_14px_rgba(27,58,107,0.35)]"
                    : "text-navy-mid/70 hover:bg-warm-gray/70"
                }`}
              >
                {t.common.tabs[id]}
              </button>
            ))}
          </div>
          <button
            onClick={() => setOnboarded(false)}
            className="ms-auto whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-navy-mid/50 transition-colors hover:text-navy"
          >
            {t.common.redoSetup}
          </button>
          <button
            onClick={resetAll}
            className="whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-navy-mid/50 transition-colors hover:text-navy"
          >
            {t.common.reset}
          </button>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-8">
        {tab === "profile" && (
          <section key="profile" className="mb-reveal">
            <h2 className="mb-6 font-serif text-2xl text-navy">{t.common.profileHeading}</h2>
            <ProfileForm profile={profile} onChange={setProfile} />
          </section>
        )}
        {tab === "mix" && (
          <section key="mix" className="mb-reveal">
            <h2 className="mb-6 font-serif text-2xl text-navy">{t.common.mixHeading}</h2>
            <TrackMixBuilder mix={mix} onChange={setMix} />
          </section>
        )}
        {tab === "results" && (
          <section key="results" className="mb-reveal">
            <h2 className="mb-6 font-serif text-2xl text-navy">{t.common.resultsHeading}</h2>
            <details className="mb-6 rounded-2xl border border-warm-border bg-white p-4 open:pb-5">
              <summary className="cursor-pointer text-sm font-semibold text-navy-mid/70">
                {t.common.advancedAssumptions}
              </summary>
              <div className="mt-4">
                <AssumptionsPanel assumptions={assumptions} onChange={setAssumptions} />
              </div>
            </details>
            <ResultsPanel result={result} />
            <div className="mt-6">
              <NextSteps />
            </div>
          </section>
        )}
        {tab === "comparison" && (
          <section key="comparison" className="mb-reveal">
            <h2 className="mb-6 font-serif text-2xl text-navy">{t.common.comparisonHeading}</h2>
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
      <VryfIDFooter />
    </div>
  );
}

export default App;
