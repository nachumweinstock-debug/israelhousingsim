import { useEffect, useState } from "react";
import type { Assumptions, BorrowerProfile, Mix } from "../types";
import { DEFAULT_ASSUMPTIONS, DEFAULT_MIX, DEFAULT_PROFILE } from "./defaults";

const STORAGE_KEY = "mashkanta-simulator-state-v1";

interface PersistedState {
  profile: BorrowerProfile;
  mix: Mix;
  assumptions: Assumptions;
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

/**
 * All simulator state lives here and persists to localStorage on every
 * change (section 3: "no screen should require a save or next button;
 * state should persist across the session so users can move back and
 * forth freely").
 */
export function useSimulatorState() {
  const persisted = loadPersisted();
  const [profile, setProfile] = useState<BorrowerProfile>(persisted?.profile ?? DEFAULT_PROFILE);
  const [mix, setMix] = useState<Mix>(persisted?.mix ?? DEFAULT_MIX);
  const [assumptions, setAssumptions] = useState<Assumptions>(persisted?.assumptions ?? DEFAULT_ASSUMPTIONS);

  useEffect(() => {
    const state: PersistedState = { profile, mix, assumptions };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [profile, mix, assumptions]);

  function resetAll() {
    setProfile(DEFAULT_PROFILE);
    setMix(DEFAULT_MIX);
    setAssumptions(DEFAULT_ASSUMPTIONS);
  }

  return { profile, setProfile, mix, setMix, assumptions, setAssumptions, resetAll };
}
