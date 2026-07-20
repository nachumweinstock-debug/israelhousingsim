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
            className="relative h-full rounded-r-pill bg-accent"
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 170, damping: 26 }}
          >
            <motion.div
              aria-hidden="true"
              className="h-full w-full overflow-hidden rounded-r-pill"
              style={{
                background:
                  "linear-gradient(100deg, transparent 32%, rgba(255,255,255,0.55) 50%, transparent 68%)",
                backgroundSize: "220% 100%",
              }}
              animate={{ backgroundPosition: ["220% 0", "-220% 0"] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
            />
            {progress > 0 ? (
              <motion.span
                aria-hidden="true"
                className="absolute -end-1 top-1/2 -mt-1.5 h-3 w-3 rounded-pill bg-accent"
                animate={{ boxShadow: [
                  "0 0 0 0 rgba(91, 155, 213, 0.5)",
                  "0 0 0 7px rgba(91, 155, 213, 0)",
                ] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
            ) : null}
          </motion.div>
        </div>
        <div className="mx-auto flex h-[72px] w-full max-w-2xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2">
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
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill border border-hairline bg-card text-lg text-ink shadow-lift hover:border-accent/50"
                >
                  {isHe ? "→" : "←"}
                </motion.button>
              ) : null}
            </AnimatePresence>
            <NeonPoweredByBadge />
          </div>
          <div className="flex flex-1 justify-center">
            <motion.img
              src="/vryfid-full-logo.jpeg"
              alt="VryfID"
              className="h-14 w-auto rounded-xl border border-hairline bg-card p-1 shadow-lift"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          </div>
          <div className="flex shrink-0 justify-end">
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

      <main className="relative flex-1 overflow-x-clip pt-[86px]">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed -left-32 top-1/4 -z-0 h-80 w-80 rounded-pill bg-accentSoft/30 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed -right-28 top-1/2 -z-0 h-72 w-72 rounded-pill bg-accent/10 blur-3xl"
          animate={{ x: [0, -26, 0], y: [0, -18, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
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
              <Route
                path="/simulator/inflationScenario"
                element={<Navigate to="/simulator/costs" replace />}
              />
              <Route path="/simulator/costs" element={<Costs />} />
              <Route path="/simulator/summary" element={<Summary />} />
              <Route path="*" element={<Navigate to="/simulator/welcome" replace />} />
            </Routes>
          </AnimatePresence>
        </FlowDirectionContext.Provider>
      </main>

      <div id="site-footer" className="mt-16 print:hidden" dir="ltr">
        <VryfIDFooter />
      </div>
    </div>
  );
}

function scrollToFooter() {
  document.getElementById("site-footer")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const NEON = "#39FF9B";

/**
 * Header badge, mirrors the language toggle on the header's other side.
 * Deep green neon glow (a deliberate one-off exception to the cream/light
 * blue palette, per Nachum's explicit request) that pulses continuously.
 * Clicking scrolls down to the VryfID footer; the footer logo scrolls
 * back up (see VryfIDFooter.tsx).
 */
function NeonPoweredByBadge() {
  return (
    <motion.button
      type="button"
      onClick={scrollToFooter}
      aria-label="Powered by VryfID — jump to footer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      animate={{
        boxShadow: [
          `0 0 3px ${NEON}88, 0 0 8px ${NEON}44`,
          `0 0 8px ${NEON}dd, 0 0 20px ${NEON}88, 0 0 32px ${NEON}33`,
          `0 0 3px ${NEON}88, 0 0 8px ${NEON}44`,
        ],
      }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      className="flex shrink-0 items-center gap-1.5 rounded-pill px-3 py-2"
      style={{
        background: "#0A1F16",
        border: `1px solid ${NEON}66`,
      }}
    >
      <span
        className="text-[11px] font-bold uppercase tracking-wide"
        style={{ color: NEON, textShadow: `0 0 6px ${NEON}aa, 0 0 14px ${NEON}55` }}
      >
        VryfID
      </span>
      <motion.span
        aria-hidden="true"
        animate={{ y: [0, 3, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ color: NEON }}
        className="text-[10px]"
      >
        ▼
      </motion.span>
    </motion.button>
  );
}
