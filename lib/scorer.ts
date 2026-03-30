import { Job, Profile } from "./types";

const ENTRY_LEVEL_PATTERNS = [
  /entry[- ]level/,
  /junior/,
  /new grad/,
  /0-2 years/,
  /fellowship/,
  /\bassociate\b/,
  /early career/,
  /recent graduate/,
];

const SENIOR_PATTERNS = [
  /\bsenior\b/,
  /\blead\b/,
  /\bdirector\b/,
  /\bprincipal\b/,
  /\bstaff\b/,
  /5\+ years/,
  /7\+ years/,
  /10\+ years/,
];

const CS_DEGREE_PATTERN =
  /\b(computer science|computer engineering|software engineering|cs degree|engineering degree)\b/;

const EQUIVALENT_PATTERN =
  /or equivalent|equivalent experience|hands-on experience/;

const AI_TECH_MEDIA_CREATIVE =
  /\b(ai|artificial intelligence|machine learning|tech|technology|media|creative|entertainment|film|music|gaming|startup)\b/;

export function scoreJob(job: Job, profile: Profile): number {
  const searchText =
    `${job.title} ${job.description} ${job.requirements.join(" ")}`.toLowerCase();

  let score = 0;

  // +20 if role category matches a resume preset label (case-insensitive partial match)
  const categoryLower = job.category.toLowerCase();
  const titleLower = job.title.toLowerCase();
  const hasPresetMatch = profile.resumePresets.some((preset) => {
    const labelLower = preset.label.toLowerCase();
    return (
      categoryLower.includes(labelLower) ||
      labelLower.includes(categoryLower) ||
      titleLower.includes(labelLower) ||
      labelLower.includes(titleLower)
    );
  });
  if (hasPresetMatch) score += 20;

  // +15 if entry-level language found
  if (ENTRY_LEVEL_PATTERNS.some((p) => p.test(searchText))) score += 15;

  // +15 if remote or NYC location
  if (job.remote || /\bnyc\b|new york/.test(job.location.toLowerCase()))
    score += 15;

  // +10 per matching skill keyword, capped at 40
  const skillPoints = profile.skills.reduce((pts, skill) => {
    if (searchText.includes(skill.toLowerCase())) return pts + 10;
    return pts;
  }, 0);
  score += Math.min(skillPoints, 40);

  // +10 if "or equivalent" / "equivalent experience" / "hands-on experience"
  if (EQUIVALENT_PATTERN.test(searchText)) score += 10;

  // +10 if no CS/engineering degree requirement found
  if (!CS_DEGREE_PATTERN.test(searchText)) score += 10;

  // +5 if company is in AI/tech/media/creative sector
  if (AI_TECH_MEDIA_CREATIVE.test(job.company.toLowerCase())) score += 5;

  // -20 if senior/lead/director/principal/staff/5+/7+/10+ years
  if (SENIOR_PATTERNS.some((p) => p.test(searchText))) score -= 20;

  // -30 if requires CS/engineering degree WITHOUT "or equivalent"
  if (CS_DEGREE_PATTERN.test(searchText) && !EQUIVALENT_PATTERN.test(searchText))
    score -= 30;

  return Math.max(0, Math.min(100, score));
}
