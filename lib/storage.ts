import { AppState } from "./types";
import { DEFAULT_PROFILE } from "./profile";
import { SEED_JOBS } from "./jobs-seed";

const STORAGE_KEY = "ryann-apply";
const VERSION_KEY = "ryann-apply-version";
const CURRENT_VERSION = "3";

const DEFAULT_SETTINGS = {
  autoApplyEnabled: false,
  autoApplyMinScore: 75,
  scrapeIntervalHours: 8,
};

function getDefaultState(): AppState {
  return {
    profile: DEFAULT_PROFILE,
    jobs: SEED_JOBS,
    applications: [],
    settings: DEFAULT_SETTINGS,
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (storedVersion !== CURRENT_VERSION) {
      // Data version mismatch -- reset to fresh seed data
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      const fresh = getDefaultState();
      saveState(fresh);
      return fresh;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = getDefaultState();
      saveState(fresh);
      return fresh;
    }
    return JSON.parse(raw) as AppState;
  } catch {
    return getDefaultState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function updateState(updater: (state: AppState) => AppState): AppState {
  const current = loadState();
  const next = updater(current);
  saveState(next);
  return next;
}

export function resetState(): AppState {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
  const fresh = getDefaultState();
  saveState(fresh);
  return fresh;
}
