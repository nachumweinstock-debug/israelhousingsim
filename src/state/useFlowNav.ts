import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { nextStep, prevStep, stepFromPath, stepPath } from "./flow";
import { useSimulatorStore } from "./simulatorStore";

/**
 * Flow-aware navigation. Reads the branching answers (residency, buyer
 * status) from the store at call time so a selection made a moment ago
 * routes through the correct branch immediately.
 */
export function useFlowNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const step = stepFromPath(location.pathname);

  const goNext = useCallback(() => {
    if (!step) return;
    const { residency, buyerStatus } = useSimulatorStore.getState();
    const target = nextStep(step, { residency, buyerStatus });
    if (target) navigate(stepPath(target));
  }, [step, navigate]);

  const goBack = useCallback(() => {
    if (!step) return;
    const { residency, buyerStatus } = useSimulatorStore.getState();
    const target = prevStep(step, { residency, buyerStatus });
    if (target) navigate(stepPath(target));
  }, [step, navigate]);

  return { step, goNext, goBack };
}
