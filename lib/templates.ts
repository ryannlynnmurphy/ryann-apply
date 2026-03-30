import { Job, Profile, BioVariant, CoverLetterBlock, ResumePreset } from "./types";

interface TemplateContext {
  bio: BioVariant;
  blocks: CoverLetterBlock[];
  preset: ResumePreset;
  skillsLine: string;
  languageLine: string;
  job: Job;
  profile: Profile;
}

function buildContext(job: Job, profile: Profile): TemplateContext {
  const preset =
    profile.resumePresets.find((p) =>
      job.category.toLowerCase().includes(p.label.toLowerCase())
    ) || profile.resumePresets[0];

  const bio =
    profile.bioVariants.find((b) => b.id === preset.defaultBioVariant) ||
    profile.bioVariants[0];

  const blocks = profile.coverLetterBlocks.filter(
    (b) =>
      b.tags.includes(job.category) || b.tags.includes("general")
  );

  const skills = preset.skills.length > 0 ? preset.skills : profile.skills.slice(0, 6);
  const skillsLine = skills.join(", ");

  const nonEnglish = profile.languages.filter((l) => l !== "English");
  const languageLine =
    nonEnglish.length > 0 ? `I also speak ${nonEnglish.join(" and ")}.` : "";

  return { bio, blocks, preset, skillsLine, languageLine, job, profile };
}

function signature(profile: Profile): string {
  return `${profile.name}\n${profile.email} · ${profile.website}`;
}

function findBlock(blocks: CoverLetterBlock[], label: string): CoverLetterBlock | undefined {
  return blocks.find((b) => b.label.toLowerCase().includes(label.toLowerCase()));
}

function techBlocks(blocks: CoverLetterBlock[]): CoverLetterBlock[] {
  return blocks.filter(
    (b) =>
      b.label.toLowerCase().includes("hazel") ||
      b.label.toLowerCase().includes("academy") ||
      b.label.toLowerCase().includes("dual-model")
  );
}

function aiSafetyTemplate(ctx: TemplateContext): string {
  const tech = techBlocks(ctx.blocks);
  const safety = findBlock(ctx.blocks, "safety");
  const parts: string[] = [
    ctx.bio.text,
    "",
    ...tech.map((b) => b.text),
    "",
    safety ? safety.text : "",
    "",
    "AI safety is not abstract to me.",
    "",
    signature(ctx.profile),
  ];
  return parts.filter((p, i, a) => !(p === "" && a[i - 1] === "")).join("\n");
}

function copywritingTemplate(ctx: TemplateContext): string {
  const writing = findBlock(ctx.blocks, "writing") || findBlock(ctx.blocks, "Edinburgh");
  const parts: string[] = [
    ctx.bio.text,
    "",
    writing ? writing.text : "",
    "",
    `Skills: ${ctx.skillsLine}.`,
    "",
    `I'd bring that range to ${ctx.job.company}.`,
    "",
    signature(ctx.profile),
  ];
  return parts.filter((p, i, a) => !(p === "" && a[i - 1] === "")).join("\n");
}

function communityTemplate(ctx: TemplateContext): string {
  const writing = findBlock(ctx.blocks, "writing") || findBlock(ctx.blocks, "Edinburgh");
  const parts: string[] = [
    ctx.bio.text,
    "",
    writing ? writing.text : "",
    "",
    "Community work starts with listening. I know how to show up, pay attention, and translate what I hear into content and programs that actually help people.",
    "",
    `Skills: ${ctx.skillsLine}.`,
    "",
    signature(ctx.profile),
  ];
  return parts.filter((p, i, a) => !(p === "" && a[i - 1] === "")).join("\n");
}

function devrelTemplate(ctx: TemplateContext): string {
  const tech = techBlocks(ctx.blocks);
  const firstTech = tech.length > 0 ? tech[0] : null;
  const parts: string[] = [
    ctx.bio.text,
    "",
    firstTech ? firstTech.text : "",
    "",
    "I am a writer who builds. That means documentation, tutorials, and blog posts that come from someone who has actually shipped the thing they're explaining.",
    "",
    signature(ctx.profile),
  ];
  return parts.filter((p, i, a) => !(p === "" && a[i - 1] === "")).join("\n");
}

function fellowshipTemplate(ctx: TemplateContext): string {
  const parts: string[] = [
    ctx.bio.text,
    "",
    ...ctx.blocks.map((b) => b.text),
    "",
    "I am 22, I am early, I am fast.",
    "",
    signature(ctx.profile),
  ];
  return parts.filter((p, i, a) => !(p === "" && a[i - 1] === "")).join("\n");
}

function generalTemplate(ctx: TemplateContext): string {
  const firstTwo = ctx.blocks.slice(0, 2);
  const parts: string[] = [
    ctx.bio.text,
    "",
    ...firstTwo.map((b) => b.text),
    "",
    `Skills: ${ctx.skillsLine}.`,
    "",
    ctx.languageLine,
    "",
    signature(ctx.profile),
  ];
  return parts
    .filter((p) => p !== undefined)
    .filter((p, i, a) => !(p === "" && (i === 0 || a[i - 1] === "")))
    .join("\n");
}

const categoryTemplateMap: Record<string, (ctx: TemplateContext) => string> = {
  "ai-safety": aiSafetyTemplate,
  copywriting: copywritingTemplate,
  community: communityTemplate,
  devrel: devrelTemplate,
  fellowship: fellowshipTemplate,
};

export function generateCoverLetterFromTemplate(
  job: Job,
  profile: Profile
): string {
  const ctx = buildContext(job, profile);
  const templateFn = categoryTemplateMap[job.category] || generalTemplate;
  return templateFn(ctx);
}
