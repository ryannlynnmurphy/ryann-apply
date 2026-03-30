import { Job, Profile, ResumePreset, Experience } from "./types";

function pickPreset(job: Job, profile: Profile): ResumePreset {
  return (
    profile.resumePresets.find((p) =>
      job.category.toLowerCase().includes(p.label.toLowerCase())
    ) || profile.resumePresets[0]
  );
}

function pickBioText(preset: ResumePreset, profile: Profile): string {
  const bio =
    profile.bioVariants.find((b) => b.id === preset.defaultBioVariant) ||
    profile.bioVariants[0];
  // Trim to 2-3 sentences max
  const sentences = bio.text.split(/(?<=\.)\s+/);
  return sentences.slice(0, 3).join(" ");
}

function orderExperience(
  experience: Experience[],
  preset: ResumePreset
): Experience[] {
  const leadIds = new Set(
    preset.leadWith.filter((id) => id.startsWith("exp-"))
  );
  const leading: Experience[] = [];
  const rest: Experience[] = [];

  for (const exp of experience) {
    if (leadIds.has(exp.id)) {
      leading.push(exp);
    } else {
      rest.push(exp);
    }
  }

  // Sort leading entries by the order in leadWith
  const leadOrder = preset.leadWith;
  leading.sort(
    (a, b) => leadOrder.indexOf(a.id) - leadOrder.indexOf(b.id)
  );

  return [...leading, ...rest];
}

interface ProjectEntry {
  name: string;
  techOrVenue: string;
  bullets: string[];
}

function getProjects(job: Job, profile: Profile): ProjectEntry[] {
  const cat = job.category.toLowerCase();
  const isTech =
    cat.includes("ai") ||
    cat.includes("safety") ||
    cat.includes("devrel") ||
    cat.includes("frontend") ||
    cat.includes("full-stack");
  const isCreative =
    cat.includes("copy") || cat.includes("community");
  const isFellowship = cat.includes("fellowship");

  const techProjects: ProjectEntry[] = [
    {
      name: "Hazel",
      techOrVenue: "Python, Claude API, Whisper STT, ElevenLabs TTS, Raspberry Pi 5",
      bullets: [
        "Local-first voice AI with on-device speech recognition and dynamic Haiku/Sonnet model routing",
        "OAuth2 integrations (Gmail, Google Calendar), Home Assistant connectivity, WebSocket backend",
        "Designed privacy-first architecture to eliminate centralized voice data collection",
      ],
    },
    {
      name: "HZL Academy (patent pending)",
      techOrVenue: "Next.js, TypeScript, Claude API, SQLite",
      bullets: [
        "K-12 educational platform with patent-pending dual-model verification architecture",
        "Two AI models cross-check outputs before content reaches learners",
        "Three-tier content routing with adaptive caching and COPPA-compliant data storage",
      ],
    },
    {
      name: "Ryann Apply",
      techOrVenue: "Next.js, TypeScript, Puppeteer, Cheerio",
      bullets: [
        "AI-powered job automation with Tinder-style discovery and profile-driven auto-fill",
        "Automated Greenhouse and Lever board scraping with scheduled crawls",
        "Claude-powered cover letter generation with modular template architecture",
      ],
    },
    {
      name: "Portfolio Site",
      techOrVenue: "HTML, CSS, JavaScript, GitHub Pages",
      bullets: [
        "Interactive portfolio with CRT monitor design, custom chatbot (30+ intents), and easter eggs",
        "Full SEO implementation: Open Graph, Twitter Cards, JSON-LD, sitemaps",
      ],
    },
    {
      name: "HZL Studio",
      techOrVenue: "Raspberry Pi 5 cluster, exo, AMD ROCm, Linux",
      bullets: [
        "Four-node distributed AI inference cluster with five switchable creative modes",
        "Voice-activated mode switching, gigabit networking, NVMe storage, solar-compatible",
      ],
    },
  ];

  const creativeProjects: ProjectEntry[] = [
    {
      name: "Grooming My Ass",
      techOrVenue: "Edinburgh Fringe Festival, 2025",
      bullets: [
        "Wrote, produced, and performed a one-woman dark comedy",
        "Crowdfunded production with Rogue Arts NYC; previewed at Theatre Under St. Marks and The Tank",
      ],
    },
    {
      name: "SCOUTS",
      techOrVenue: "The Juilliard School, 2025",
      bullets: [
        "Professional reading at Juilliard exploring cycles of toxic masculinity",
        "Also produced at Fordham University Theatre (Oct 2024)",
      ],
    },
    {
      name: "Thoughts on Girlcock",
      techOrVenue: "Fordham University, 2025 (thesis production)",
      bullets: [
        "Wrote and starred in university thesis production",
      ],
    },
    {
      name: "Opinion Column",
      techOrVenue: "The Fordham Observer, 2024-2025",
      bullets: [
        "Published editorial content on culture, arts, and social issues in AP Style",
        "Year-long column with real readership and hard deadlines",
      ],
    },
  ];

  if (isFellowship) {
    return [...techProjects.slice(0, 3), ...creativeProjects.slice(0, 2)];
  }
  if (isCreative) {
    return [...creativeProjects, ...techProjects.slice(0, 2)];
  }
  if (isTech) {
    return techProjects;
  }
  // hybrid / general
  return [...techProjects.slice(0, 3), ...creativeProjects.slice(0, 2)];
}

function formatDate(d: string): string {
  if (d === "present") return "Present";
  // Handle "2021" or "2025-08" etc
  if (/^\d{4}$/.test(d)) return d;
  const parts = d.split("-");
  if (parts.length === 2) {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const monthIdx = parseInt(parts[1], 10) - 1;
    return `${months[monthIdx] || parts[1]} ${parts[0]}`;
  }
  return d;
}

export function generateResume(job: Job, profile: Profile): string {
  const preset = pickPreset(job, profile);
  const summary = pickBioText(preset, profile);
  const orderedExp = orderExperience(profile.experience, preset);
  const projects = getProjects(job, profile);
  const skills = preset.skills.length > 0 ? preset.skills : profile.skills.slice(0, 10);

  const lines: string[] = [];

  // Header
  lines.push(profile.name.toUpperCase());
  const contactParts = [
    profile.email,
    profile.website,
    profile.github,
    profile.linkedin,
  ].filter(Boolean);
  lines.push(contactParts.join(" | "));
  const locationLang = [
    profile.location,
    profile.languages.join(", "),
  ]
    .filter(Boolean)
    .join(" | ");
  lines.push(locationLang);

  // Summary
  lines.push("");
  lines.push("SUMMARY");
  lines.push(summary);

  // Experience
  lines.push("");
  lines.push("EXPERIENCE");
  for (const exp of orderedExp) {
    lines.push(
      `${exp.title} -- ${exp.org} | ${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`
    );
    lines.push(exp.description);
    lines.push("");
  }

  // Projects
  lines.push("PROJECTS");
  for (const proj of projects) {
    lines.push(`${proj.name} | ${proj.techOrVenue}`);
    for (const bullet of proj.bullets) {
      lines.push(`- ${bullet}`);
    }
    lines.push("");
  }

  // Education
  lines.push("EDUCATION");
  for (const edu of profile.education) {
    lines.push(
      `${edu.school} | ${edu.degree} ${edu.field} | ${edu.graduationYear}`
    );
    if (edu.notes) {
      lines.push(edu.notes);
    }
  }

  // Skills
  lines.push("");
  lines.push("SKILLS");
  lines.push(skills.join(", "));

  return lines.join("\n");
}
