import { useMemo, useState } from "react";
import { ProfileForm } from "./components/ProfileForm";
import { TrackMixBuilder } from "./components/TrackMixBuilder";
import { AssumptionsPanel } from "./components/AssumptionsPanel";
import { ResultsPanel } from "./components/ResultsPanel";
import { ComparisonPanel } from "./components/ComparisonPanel";
import { NextSteps } from "./components/NextSteps";
import { ExportPanel } from "./components/ExportPanel";
import { PrintSummary, type PrintMode } from "./components/PrintSummary";
import { ShareLinks } from "./components/ShareLinks";
import { ComputingView } from "./components/ComputingView";
import { Disclaimer } from "./components/ui/Disclaimer";
import { LanguageToggle } from "./components/ui/LanguageToggle";
import { VryfIDFooter } from "./components/VryfIDFooter";
import { Wizard } from "./components/Wizard";
import { useSimulatorState } from "./state/useSimulatorState";
import { computeMixResult } from "./engine/mix";
import { RULE_SET } from "./engine/rules";
import { useLang } from "./i18n";

type TabId = "profile" | "mix" | "results" | "comparison";

const TAB_IDS: TabId[] = ["profile", "mix", "results", "comparison"];

function Hero() {
  const { t } = useLang();
  return (
    <div className="border-b border-warm-border bg-cream">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 text-center sm:px-8 sm:py-16">
        <div className="mb-8 flex justify-center mb-reveal">
          <img src="/vryfid-full-logo.jpeg" alt="VryfID" className="h-9 w-auto rounded-md" />
        </div>

        <div
          className="mb-6 inline-flex items-center justify-center gap-2.5 mb-reveal"
          style={{ animationDelay: "0.04s" }}
        >
          <span className="h-px w-8 bg-navy/15" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-accent">
            {t.hero.eyebrow}
          </span>
          <span className="h-px w-8 bg-navy/15" />
        </div>

        <h1
          className="mb-5 font-serif leading-[1.08] text-navy mb-reveal"
          style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", animationDelay: "0.06s" }}
        >
          {t.hero.h1a}
          <br />
          <em className="not-italic text-sky-accent">{t.hero.h1b}</em>
        </h1>

        <p
          className="mx-auto mb-10 max-w-lg text-base font-light leading-relaxed text-navy-mid/65 mb-reveal"
          style={{ animationDelay: "0.12s" }}
        >
          {t.hero.sub}
        </p>

        <div
          className="mx-auto flex max-w-lg justify-center gap-8 border-y border-warm-border py-5 mb-reveal sm:gap-12"
          style={{ animationDelay: "0.18s" }}
        >
          {t.hero.stats.map(([value, label]) => (
            <div key={label} className="text-center">
              <p className="font-serif text-2xl tracking-tight text-navy">{value}</p>
              <p className="mt-1 text-xs tracking-wide text-navy-mid/50">{label}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-xl mb-reveal" style={{ animationDelay: "0.24s" }} aria-hidden="true">
          <svg viewBox="0 0 640 120" className="h-auto w-full">
            <path d="M24 86 C112 74 154 42 234 52 C314 62 344 96 426 70 C492 49 548 43 616 34" fill="none" stroke="#5D9BE6" strokeWidth="4" strokeLinecap="round" />
            <path d="M24 98 H616" stroke="#DCE6F3" strokeWidth="2" strokeLinecap="round" />
            {[96, 224, 352, 480, 608].map((x, i) => (
              <g key={x}>
                <line x1={x} y1={96} x2={x} y2={42 + i * 5} stroke="#DCE6F3" strokeWidth="2" strokeDasharray="4 6" />
                <circle cx={x} cy={i === 0 ? 75 : i === 1 ? 52 : i === 2 ? 85 : i === 3 ? 54 : 36} r="6" fill="#1B3A6B" />
              </g>
            ))}
          </svg>
        </div>

        <ShareLinks placement="hero" className="mt-6 mb-reveal" />
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
  const [finishing, setFinishing] = useState(false);
  const [printMode, setPrintMode] = useState<PrintMode>("both");

  const result = useMemo(
    () => computeMixResult(mix, profile, assumptions, RULE_SET),
    [mix, profile, assumptions]
  );

  if (finishing) {
    return <ComputingView />;
  }

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
            setFinishing(true);
            setTimeout(() => {
              setOnboarded(true);
              setTab("results");
              setFinishing(false);
            }, 2400);
          }}
        />
      </>
    );
  }

  function printSummary(mode: PrintMode) {
    setPrintMode(mode);
    window.requestAnimationFrame(() => {
      window.setTimeout(() => window.print(), 50);
    });
  }

  return (
    <>
    <PrintSummary profile={profile} mix={mix} result={result} assumptions={assumptions} mode={printMode} />
    <div className="flex min-h-screen flex-col bg-cream print:hidden">
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
              <NextSteps result={result} profile={profile} />
            </div>
            <div className="mt-6">
              <ExportPanel
                profile={profile}
                mix={mix}
                result={result}
                assumptions={assumptions}
                onPrint={printSummary}
              />
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
    </>
  );
}

export default App;
