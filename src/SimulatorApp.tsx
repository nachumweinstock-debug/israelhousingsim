import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { FlowDirectionContext } from "./components/QuestionShell";
import { VryfIDFooter } from "./components/VryfIDFooter";
import { prevStep, stepFromPath, stepOrderIndex, stepPath, stepProgress } from "./state/flow";
import { useSimulatorStore } from "./state/simulatorStore";
import { useSimLang } from "./state/useSimLang";
import type { Lang } from "./i18n";
import { Welcome } from "./routes/welcome";
import { Residency } from "./routes/residency";
import { AliyahDetails } from "./routes/aliyahDetails";
import { BuyerStatus } from "./routes/buyerStatus";
import { PropertyPrice } from "./routes/propertyPrice";
import { DownPayment } from "./routes/downPayment";
import { Term } from "./routes/term";
import { TrackMixStep } from "./routes/trackMix";
import { InflationScenario } from "./routes/inflationScenario";
import { Costs } from "./routes/costs";
import { Summary } from "./routes/summary";

export default function SimulatorApp() {
  return (
    <BrowserRouter>
      <FlowChrome />
    </BrowserRouter>
  );
}

/**
 * Persistent chrome (progress bar + back arrow) around the animated
 * question routes. Direction is derived from the step ordering, so the
 * browser's own back/forward buttons animate correctly too, not just the
 * in-app controls.
 */
const LANG_CHOICES: Array<{ value: Lang; label: string }> = [
  { value: "en", label: "EN" },
  { value: "he", label: "עברית" },
];

function FlowChrome() {
  const location = useLocation();
  const navigate = useNavigate();
  const residency = useSimulatorStore((state) => state.residency);
  const { lang, setLang, s, isHe } = useSimLang();

  const step = stepFromPath(location.pathname);
  const orderIndex = step ? stepOrderIndex(step) : 0;
  const prevIndexRef = useRef(orderIndex);
  const logicalDirection: 1 | -1 = orderIndex >= prevIndexRef.current ? 1 : -1;
  // In RTL, forward means sliding leftward, so the visual direction flips.
  const direction = (isHe ? -logicalDirection : logicalDirection) as 1 | -1;
  useEffect(() => {
    prevIndexRef.current = orderIndex;
  });

  const progress = step ? stepProgress(step, residency) : 0;
  const backTarget = step ? prevStep(step, residency) : null;

  return (
    <div className="flex min-h-screen flex-col bg-cream font-sans text-ink print:hidden">
      <header className="fixed inset-x-0 top-0 z-40 bg-cream/90 backdrop-blur-sm">
        <div className="h-1.5 w-full bg-accentSoft/35">
          <motion.div
            className="h-full overflow-hidden rounded-r-pill bg-accent"
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 170, damping: 26 }}
          >
            <motion.div
              aria-hidden="true"
              className="h-full w-full"
              style={{
                background:
                  "linear-gradient(100deg, transparent 32%, rgba(255,255,255,0.55) 50%, transparent 68%)",
                backgroundSize: "220% 100%",
              }}
              animate={{ backgroundPosition: ["220% 0", "-220% 0"] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between gap-3 px-4">
          <div className="flex w-24 justify-start">
            <AnimatePresence>
              {backTarget ? (
                <motion.button
                  type="button"
                  aria-label={s.common.backAria}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => navigate(stepPath(backTarget))}
                  className="flex h-10 w-10 items-center justify-center rounded-pill border border-hairline bg-card text-lg text-ink shadow-lift hover:border-accent/50"
                >
                  {isHe ? "→" : "←"}
                </motion.button>
              ) : null}
            </AnimatePresence>
          </div>
          <div className="flex flex-1 justify-center">
            <img src="/vryfid-full-logo.jpeg" alt="VryfID" className="h-7 w-auto rounded-md" />
          </div>
          <div className="flex w-24 justify-end">
            <div className="flex items-center gap-0.5 rounded-pill border border-hairline bg-card p-1 shadow-lift">
              {LANG_CHOICES.map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  onClick={() => setLang(choice.value)}
                  className={`rounded-pill px-2.5 py-1 text-xs font-semibold transition-colors ${
                    lang === choice.value
                      ? "bg-accent text-white"
                      : "text-inkMuted hover:text-ink"
                  }`}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-[68px]">
        <FlowDirectionContext.Provider value={direction}>
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/simulator/welcome" element={<Welcome />} />
              <Route path="/simulator/residency" element={<Residency />} />
              <Route path="/simulator/aliyahDetails" element={<AliyahDetails />} />
              <Route path="/simulator/buyerStatus" element={<BuyerStatus />} />
              <Route path="/simulator/propertyPrice" element={<PropertyPrice />} />
              <Route path="/simulator/downPayment" element={<DownPayment />} />
              <Route path="/simulator/term" element={<Term />} />
              <Route path="/simulator/trackMix" element={<TrackMixStep />} />
              <Route path="/simulator/inflationScenario" element={<InflationScenario />} />
              <Route path="/simulator/costs" element={<Costs />} />
              <Route path="/simulator/summary" element={<Summary />} />
              <Route path="*" element={<Navigate to="/simulator/welcome" replace />} />
            </Routes>
          </AnimatePresence>
        </FlowDirectionContext.Provider>
      </main>

      <div className="mt-16 print:hidden" dir="ltr">
        <VryfIDFooter />
      </div>
    </div>
  );
}
