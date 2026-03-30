import { AppState, Job } from "./types";
import { DEFAULT_PROFILE } from "./profile";
import { SEED_JOBS } from "./jobs-seed";
import { generateResume } from "./resume";
import { generateCoverLetterFromTemplate } from "./templates";

const STORAGE_KEY = "ryann-apply";
const VERSION_KEY = "ryann-apply-version";
const CURRENT_VERSION = "4";

const DEFAULT_SETTINGS = {
  autoApplyEnabled: false,
  autoApplyMinScore: 75,
  scrapeIntervalHours: 8,
};

function ensureMaterials(jobs: Job[]): Job[] {
  const profile = DEFAULT_PROFILE;
  return jobs.map((job) => {
    if (!job.generatedMaterials?.coverLetter || !job.generatedMaterials?.resume) {
      const coverLetter = job.generatedMaterials?.coverLetter || generateCoverLetterFromTemplate(job, profile);
      const resume = job.generatedMaterials?.resume || generateResume(job, profile);
      const preset = profile.resumePresets.find((p) =>
        job.category.toLowerCase().includes(p.label.toLowerCase())
      ) || profile.resumePresets[0];
      return {
        ...job,
        generatedMaterials: {
          coverLetter,
          resume,
          bioVariantUsed: job.generatedMaterials?.bioVariantUsed || preset?.defaultBioVariant || "",
          resumePresetUsed: job.generatedMaterials?.resumePresetUsed || preset?.id || "",
          customAnswers: job.generatedMaterials?.customAnswers || [],
        },
      };
    }
    return job;
  });
}

function getDefaultState(): AppState {
  return {
    profile: DEFAULT_PROFILE,
    jobs: ensureMaterials(SEED_JOBS),
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
