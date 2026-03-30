import { Job, Profile, BioVariant, CoverLetterBlock, ResumePreset } from "./types";

interface TemplateContext {
  bio: BioVariant;
  blocks: CoverLetterBlock[];
  preset: ResumePreset;
  skillsLine: string;
  languageLine: string;
  job: Job;
  profile: Profile;
  companyName: string;
  jobTitle: string;
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

  return {
    bio,
    blocks,
    preset,
    skillsLine,
    languageLine,
    job,
    profile,
    companyName: job.company,
    jobTitle: job.title,
  };
}

function signature(profile: Profile): string {
  return `${profile.name}\n${profile.email}\n${profile.website}`;
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

function joinParagraphs(paragraphs: string[]): string {
  return paragraphs.filter((p) => p.trim() !== "").join("\n\n");
}

function aiSafetyTemplate(ctx: TemplateContext): string {
  const hazel = findBlock(ctx.blocks, "hazel");
  const academy = findBlock(ctx.blocks, "academy");
  const safety = findBlock(ctx.blocks, "safety");
  const writing = findBlock(ctx.blocks, "writing") || findBlock(ctx.blocks, "Edinburgh");
  const german = findBlock(ctx.blocks, "german");

  const opening = `Dear ${ctx.companyName} Team,\n\nI'm a playwright who builds AI systems. I want to be your ${ctx.jobTitle}.`;

  const background = `I graduated from Fordham University with a BA in Playwriting and Performance -- a discipline that is, at its core, about finding where systems fail. Every play I've written begins with the same question: what does this character want, and what does the world deny them? Applied to AI, that question becomes: what does this model assume, and where does that assumption crack? Adversarial thinking isn't a skill I learned in a security course. It's the lens I was trained in for four years.`;

  const techParts: string[] = [];
  if (hazel) techParts.push(hazel.text);
  if (academy) techParts.push(academy.text);
  const techParagraph = techParts.length > 0
    ? `In the past year I've shipped two production AI systems from scratch. ${techParts.join(" ")} That instinct -- to build the adversarial check into the system itself -- is what drew me to this work.`
    : "";

  const writingParagraph = writing ? writing.text : "";

  const whyCompany = safety
    ? `I want to work at ${ctx.companyName} because ${safety.text.charAt(0).toLowerCase()}${safety.text.slice(1)}`
    : `I want to work at ${ctx.companyName} because AI safety is not abstract to me. I am building AI products that live in people's homes and classrooms, and the question of what these systems can be made to do by a motivated bad actor is one I think about constantly.`;

  const germanLine = german ? german.text : "";

  const parts = [
    opening,
    background,
    techParagraph,
    writingParagraph,
    germanLine,
    whyCompany,
    signature(ctx.profile),
  ];

  return joinParagraphs(parts);
}

function copywritingTemplate(ctx: TemplateContext): string {
  const writing = findBlock(ctx.blocks, "writing") || findBlock(ctx.blocks, "Edinburgh");
  const hazel = findBlock(ctx.blocks, "hazel");
  const academy = findBlock(ctx.blocks, "academy");
  const german = findBlock(ctx.blocks, "german");

  const opening = `Dear ${ctx.companyName} Team,\n\nI'm a produced playwright, a four-year newspaper columnist, and I build AI systems. I'm applying for the ${ctx.jobTitle} role.`;

  const writingParagraph = writing
    ? `My writing background is not theoretical. ${writing.text} That range -- stage to newsroom to editorial page -- means I can shift register, format, and audience without warm-up time. I've written 800-word columns on tight deadlines and 90-minute scripts on longer ones. Both require the same discipline: know your audience, cut the filler, land the point.`
    : "";

  const techParts: string[] = [];
  if (hazel) techParts.push(hazel.text);
  if (academy) techParts.push(academy.text);
  const techParagraph = techParts.length > 0
    ? `I also build the products I'd be writing about. ${techParts.join(" ")} This means I understand technical concepts from the inside -- I don't need an engineer to translate before I can write.`
    : "";

  const whyCompany = `I want to write for ${ctx.companyName} because good copy comes from people who actually understand what they're selling. I have the editorial instincts of a trained writer and the technical fluency of someone who ships code. That combination is rare, and it's exactly what a ${ctx.jobTitle} role demands.`;

  const germanLine = german ? german.text : "";

  const skills = `Core skills: ${ctx.skillsLine}.`;

  const parts = [
    opening,
    writingParagraph,
    techParagraph,
    whyCompany,
    germanLine,
    skills,
    signature(ctx.profile),
  ];

  return joinParagraphs(parts);
}

function communityTemplate(ctx: TemplateContext): string {
  const writing = findBlock(ctx.blocks, "writing") || findBlock(ctx.blocks, "Edinburgh");
  const hazel = findBlock(ctx.blocks, "hazel");
  const german = findBlock(ctx.blocks, "german");

  const opening = `Dear ${ctx.companyName} Team,\n\nCommunity work starts with listening. I've spent four years doing it professionally -- as a newspaper columnist, a playwright, and now as a founder building AI tools for learners. I'm applying for the ${ctx.jobTitle} role.`;

  const writingParagraph = writing
    ? `My background is built on understanding audiences. ${writing.text} A column only works if people read it twice. A play only works if the audience stays. I've spent years learning what makes people pay attention, come back, and feel like something was made for them -- and that's the same skill that makes community work effective.`
    : "";

  const techParagraph = hazel
    ? `I'm also technical. ${hazel.text} I built HZL Academy, an educational platform in Next.js 14 with a dual-model verification architecture, because I wanted to create something that actually serves the community it's for -- learners from 3K through 12th grade. Building for a community and building with a community are skills I practice every day as a founder.`
    : "";

  const whyCompany = `I want to work at ${ctx.companyName} because community roles done well require someone who can write, who understands the product deeply enough to help users, and who genuinely cares about the people on the other side of the screen. I'm a writer who builds. That means I can create content, troubleshoot technical questions, and translate between your engineering team and your users without losing either audience.`;

  const germanLine = german ? german.text : "";

  const skills = `Core skills: ${ctx.skillsLine}.`;

  const parts = [
    opening,
    writingParagraph,
    techParagraph,
    whyCompany,
    germanLine,
    skills,
    signature(ctx.profile),
  ];

  return joinParagraphs(parts);
}

function devrelTemplate(ctx: TemplateContext): string {
  const hazel = findBlock(ctx.blocks, "hazel");
  const academy = findBlock(ctx.blocks, "academy");
  const writing = findBlock(ctx.blocks, "writing") || findBlock(ctx.blocks, "Edinburgh");

  const opening = `Dear ${ctx.companyName} Team,\n\nI am a writer who builds. That means documentation, tutorials, and blog posts that come from someone who has actually shipped the thing they're explaining. I'm applying for the ${ctx.jobTitle} role.`;

  const techParts: string[] = [];
  if (hazel) techParts.push(hazel.text);
  if (academy) techParts.push(academy.text);
  const techParagraph = techParts.length > 0
    ? `Here's what I've shipped recently. ${techParts.join(" ")} These aren't tutorials I followed -- they're production systems I architected, built, and maintain. When I write about WebSocket backends or model routing or OAuth2 flows, I'm writing from direct experience, not documentation summaries.`
    : "";

  const writingParagraph = writing
    ? `My writing credentials are equally concrete. ${writing.text} Four years of deadline-driven editorial work taught me how to explain complex ideas clearly and concisely. Playwriting taught me structure, pacing, and how to hold attention. Both translate directly to technical writing that developers actually want to read.`
    : "";

  const whyCompany = `I want to do developer relations at ${ctx.companyName} because the best DevRel comes from people who live on both sides of the API. I'm a developer who writes professionally and a writer who develops professionally. I can build sample apps, write the blog post about them, present them to a room, and answer the technical questions afterward -- all without handing off to someone else.`;

  const parts = [
    opening,
    techParagraph,
    writingParagraph,
    whyCompany,
    signature(ctx.profile),
  ];

  return joinParagraphs(parts);
}

function fellowshipTemplate(ctx: TemplateContext): string {
  const hazel = findBlock(ctx.blocks, "hazel");
  const academy = findBlock(ctx.blocks, "academy");
  const writing = findBlock(ctx.blocks, "writing") || findBlock(ctx.blocks, "Edinburgh");
  const safety = findBlock(ctx.blocks, "safety");

  const opening = `Dear ${ctx.companyName} Team,\n\nI graduated from Fordham University three months ago with a BA in Playwriting. Since then I've founded an AI company, shipped two production systems, and started building an educational platform for children. I'm applying for the ${ctx.jobTitle}.`;

  const techParts: string[] = [];
  if (hazel) techParts.push(hazel.text);
  if (academy) techParts.push(academy.text);
  const techParagraph = techParts.length > 0
    ? `Here is what I've built. ${techParts.join(" ")} I didn't learn to code in a CS program. I learned because I had products I needed to exist, and no one was going to build them for me. That self-directed intensity is what I'd bring to this fellowship.`
    : "";

  const writingParagraph = writing
    ? `The other half of my background is writing. ${writing.text} I am not a technologist who picked up writing as a soft skill. I am a trained writer who picked up engineering because the work demanded it.`
    : "";

  const safetyLine = safety ? safety.text : "";

  const whyCompany = `I want this fellowship at ${ctx.companyName} because I am 22, I am early, and I am fast. I have already demonstrated that I can ship production work independently and under pressure. What I need now is the mentorship, structure, and access that a program like this provides -- and what I'd give back is the energy and output of someone who has been building at full speed since before graduation.`;

  const parts = [
    opening,
    techParagraph,
    writingParagraph,
    safetyLine,
    whyCompany,
    signature(ctx.profile),
  ];

  return joinParagraphs(parts);
}

function generalTemplate(ctx: TemplateContext): string {
  const hazel = findBlock(ctx.blocks, "hazel");
  const academy = findBlock(ctx.blocks, "academy");
  const writing = findBlock(ctx.blocks, "writing") || findBlock(ctx.blocks, "Edinburgh");
  const german = findBlock(ctx.blocks, "german");

  const opening = `Dear ${ctx.companyName} Team,\n\nI'm a playwright who builds AI systems -- and I'm applying for the ${ctx.jobTitle} role because that combination is more relevant than it sounds.`;

  const background = `I graduated from Fordham University with a BA in Playwriting and Performance on a full scholarship. Since then I've founded HZL AI LLC and shipped two production AI systems from scratch. My background is unusual, and that's the point: I think differently because I was trained differently.`;

  const techParts: string[] = [];
  if (hazel) techParts.push(hazel.text);
  if (academy) techParts.push(academy.text);
  const techParagraph = techParts.length > 0
    ? `On the technical side: ${techParts.join(" ")}`
    : "";

  const writingParagraph = writing
    ? `On the creative side: ${writing.text}`
    : "";

  const germanLine = german ? german.text : "";

  const whyCompany = `I want to work at ${ctx.companyName} because I'm looking for a team that values range. I can write a technical blog post and a brand campaign in the same afternoon. I can debug a WebSocket connection and then explain what went wrong in plain English. The ${ctx.jobTitle} role asks for someone who can operate across domains -- that's not a stretch for me, it's how I've worked my entire career.`;

  const skills = `Core skills: ${ctx.skillsLine}.`;

  const parts = [
    opening,
    background,
    techParagraph,
    writingParagraph,
    germanLine,
    whyCompany,
    skills,
    signature(ctx.profile),
  ];

  return joinParagraphs(parts);
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
