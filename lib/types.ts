export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  graduationYear: string;
  notes: string;
}

export interface Experience {
  id: string;
  title: string;
  org: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface BioVariant {
  id: string;
  label: string;
  text: string;
}

export interface CoverLetterBlock {
  id: string;
  label: string;
  text: string;
  tags: string[];
}

export interface ResumePreset {
  id: string;
  label: string;
  leadWith: string[];
  skills: string[];
  defaultBioVariant: string;
}

export interface Profile {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  education: Education[];
  experience: Experience[];
  skills: string[];
  languages: string[];
  bioVariants: BioVariant[];
  coverLetterBlocks: CoverLetterBlock[];
  resumePresets: ResumePreset[];
}

export interface FormField {
  name: string;
  type: "text" | "textarea" | "file" | "select" | "checkbox";
  required: boolean;
  value?: string;
}

export interface GeneratedMaterials {
  coverLetter: string;
  bioVariantUsed: string;
  resumePresetUsed: string;
  customAnswers: { question: string; answer: string }[];
}

export type JobSource = "seed" | "scraped" | "manual";
export type JobStatus = "new" | "swiped-right" | "skipped" | "saved" | "queued" | "applied" | "rejected";
export type ApplyTier = "full-auto" | "one-click" | "guided";
export type ApplicationStatus = "ready" | "in-progress" | "submitted" | "rejected" | "offer";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  salary?: string;
  url: string;
  source: JobSource;
  category: string;
  description: string;
  requirements: string[];
  postedDate?: string;
  deadline?: string;
  matchScore: number;
  whyYou: string[];
  applyTier: ApplyTier;
  formFields?: FormField[];
  status: JobStatus;
  generatedMaterials?: GeneratedMaterials;
}

export interface Application {
  jobId: string;
  status: ApplicationStatus;
  appliedAt?: string;
  notes: string;
}

export interface Settings {
  autoApplyEnabled: boolean;
  autoApplyMinScore: number;
  scrapeIntervalHours: number;
}

export interface AppState {
  profile: Profile;
  jobs: Job[];
  applications: Application[];
  settings: Settings;
}
