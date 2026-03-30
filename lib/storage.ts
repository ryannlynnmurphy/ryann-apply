import { AppState } from "./types";
import { DEFAULT_PROFILE } from "./profile";

const STORAGE_KEY = "ryann-apply";

const DEFAULT_SETTINGS = {
  autoApplyEnabled: false,
  autoApplyMinScore: 75,
  scrapeIntervalHours: 8,
};

function getDefaultState(): AppState {
  return {
    profile: DEFAULT_PROFILE,
    jobs: [],
    applications: [],
    settings: DEFAULT_SETTINGS,
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
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
