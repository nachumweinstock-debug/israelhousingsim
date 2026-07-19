import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { nextStep, prevStep, stepFromPath, stepPath } from "./flow";
import { useSimulatorStore } from "./simulatorStore";

/**
 * Flow-aware navigation. Reads residency from the store at call time so a
 * selection made a moment ago (e.g. picking oleh chadash right before
 * advancing) routes through the correct branch.
 */
export function useFlowNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const step = stepFromPath(location.pathname);

  const goNext = useCallback(() => {
    if (!step) return;
    const { residency } = useSimulatorStore.getState();
    const target = nextStep(step, residency);
    if (target) navigate(stepPath(target));
  }, [step, navigate]);

  const goBack = useCallback(() => {
    if (!step) return;
    const { residency } = useSimulatorStore.getState();
    const target = prevStep(step, residency);
    if (target) navigate(stepPath(target));
  }, [step, navigate]);

  return { step, goNext, goBack };
}
