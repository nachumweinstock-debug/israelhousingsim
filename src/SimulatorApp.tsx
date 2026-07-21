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
import { ExistingHomeStatus } from "./routes/existingHomeStatus";
import { IncomeDebt } from "./routes/incomeDebt";
import { PropertyPrice } from "./routes/propertyPrice";
import { DownPayment } from "./routes/downPayment";
import { DownPaymentSource } from "./routes/downPaymentSource";
import { Term } from "./routes/term";
import { TrackMixStep } from "./routes/trackMix";
import { Costs } from "./routes/costs";
import { InvestorCashFlow } from "./routes/investorCashFlow";
import { CreditStanding } from "./routes/creditStanding";
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
  const buyerStatus = useSimulatorStore((state) => state.buyerStatus);
  const flowCtx = { residency, buyerStatus };
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

  const progress = step ? stepProgress(step, flowCtx) : 0;
  const backTarget = step ? prevStep(step, flowCtx) : null;

  return (
    <div className="flex min-h-screen flex-col bg-cream font-sans text-ink print:hidden">
      <header className="fixed inset-x-0 top-0 z-40 bg-cream/90 backdrop-blur-sm">
        {/* Before: a plain block div with a width-animated child always fills
            from the physical left, and rounded-r-pill always rounds the
            physical right corner, regardless of language, on this persistent
            per-screen chrome. In Hebrew the fill should grow from the right
            toward the left, matching the reading direction and the direction
            flip already applied to the slide animations below. After: `flex`
            makes the child align to the flex main-axis start, which is
            direction aware, and rounded-e-pill rounds whichever corner is
            actually the leading edge in the current direction. */}
        <div className="flex h-1.5 w-full bg-accentSoft/35">
          <motion.div
            className="relative h-full rounded-e-pill bg-accent"
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 170, damping: 26 }}
          >
            <motion.div
              aria-hidden="true"
              className="h-full w-full overflow-hidden rounded-e-pill"
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
        <div className="mx-auto flex h-16 w-full max-w-2xl items-center justify-between gap-1.5 px-2 sm:h-[72px] sm:gap-3 sm:px-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
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
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill border border-hairline bg-card text-lg text-ink shadow-lift hover:border-accent/50 sm:h-10 sm:w-10"
                >
                  {isHe ? "→" : "←"}
                </motion.button>
              ) : null}
            </AnimatePresence>
            <PoweredByPill />
          </div>
          <div className="flex flex-1 justify-center">
            <motion.img
              src="/vryfid-full-logo.jpeg"
              alt="VryfID"
              className="h-10 w-auto rounded-xl border border-hairline bg-card p-1 shadow-lift sm:h-14"
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
                  className={`rounded-pill px-2 py-1 text-xs font-semibold transition-colors sm:px-2.5 ${
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

      <main className="relative flex-1 overflow-x-clip pt-[78px] sm:pt-[86px]">
        {/* Before: -left-/-right- pinned these ambient blobs to a physical
            side, so they sat on the same side of the screen in both
            languages instead of mirroring like the rest of the layout.
            After: logical -start-/-end- flip them along with everything
            else. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed -start-32 top-1/4 -z-0 h-80 w-80 rounded-pill bg-accentSoft/30 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed -end-28 top-1/2 -z-0 h-72 w-72 rounded-pill bg-accent/10 blur-3xl"
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
              <Route path="/simulator/existingHomeStatus" element={<ExistingHomeStatus />} />
              <Route path="/simulator/incomeDebt" element={<IncomeDebt />} />
              <Route path="/simulator/propertyPrice" element={<PropertyPrice />} />
              <Route path="/simulator/downPayment" element={<DownPayment />} />
              <Route path="/simulator/downPaymentSource" element={<DownPaymentSource />} />
              <Route path="/simulator/term" element={<Term />} />
              <Route path="/simulator/trackMix" element={<TrackMixStep />} />
              <Route
                path="/simulator/inflationScenario"
                element={<Navigate to="/simulator/costs" replace />}
              />
              <Route path="/simulator/costs" element={<Costs />} />
              <Route path="/simulator/investorCashFlow" element={<InvestorCashFlow />} />
              <Route path="/simulator/creditStanding" element={<CreditStanding />} />
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

/**
 * Header badge, mirrors the language toggle on the header's other side.
 * A direct port of the "Powered by VryfID" pill from vryfidvibes.com
 * (client/src/App.jsx + index.css .powered-by-badge / badgeShimmer),
 * same deep teal gradient, amber glow border, amber dot, mint "Powered
 * by" label, and the warm-to-teal shimmering "VryfID" wordmark. A real
 * outbound link to vryfid.com, same as the reference site, not an in
 * page scroll, which is also what the trailing external-link arrow
 * already implied.
 */
function PoweredByPill() {
  return (
    <motion.a
      href="https://www.vryfid.com/"
      target="_blank"
      rel="noreferrer"
      aria-label="Powered by VryfID, opens vryfid.com"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="flex shrink-0 items-center gap-[7px] rounded-pill px-2.5 py-1.5 no-underline sm:px-4 sm:py-[7px]"
      style={{
        background: "linear-gradient(135deg, #0C3C38 0%, #115E59 100%)",
        border: "1px solid rgba(251, 191, 36, 0.35)",
        boxShadow: "0 0 20px rgba(251, 191, 36, 0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#FBBF24",
          boxShadow: "0 0 8px #FBBF24",
          flexShrink: 0,
        }}
      />
      <span
        className="hidden sm:inline"
        style={{ fontSize: 11, color: "#99F6E4", fontWeight: 500, letterSpacing: "0.3px" }}
      >
        Powered by
      </span>
      <motion.span
        style={{
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: "-0.2px",
          backgroundImage:
            "linear-gradient(110deg, #FEF3E4 20%, #FFB547 40%, #FF6B5B 48%, #FEF3E4 56%, #5EEAD4 65%, #FEF3E4 80%)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
        }}
        animate={{ backgroundPosition: ["-200% 50%", "200% 50%"] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
      >
        VryfID
      </motion.span>
      <span
        aria-hidden="true"
        className="hidden sm:inline"
        style={{ fontSize: 11, color: "#FBBF24", fontWeight: 700 }}
      >
        ↗
      </span>
    </motion.a>
  );
}
