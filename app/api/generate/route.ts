import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Profile } from "@/lib/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface GenerateRequestBody {
  jobDescription: string;
  jobTitle: string;
  company: string;
  category: string;
  profile: Profile;
  existingLetters?: string[];
}

function buildSystemPrompt(profile: Profile): string {
  const experience = profile.experience
    .map((e) => `${e.title} at ${e.org} (${e.startDate}–${e.endDate}): ${e.description}`)
    .join("\n");

  const education = profile.education
    .map((e) => `${e.degree} in ${e.field}, ${e.school} (${e.graduationYear}). ${e.notes}`)
    .join("\n");

  return `You are writing a cover letter as Ryann Lynn Murphy. Write in first person.

Background:
${experience}

Education:
${education}

Skills: ${profile.skills.join(", ")}
Languages: ${profile.languages.join(", ")}
Location: ${profile.location}

Style rules:
- Direct and confident. No filler, no cliches, no emojis.
- Under 400 words.
- Do not start with "I am writing to express my interest" or any variation of that.
- Do not use "passionate" or "excited" or "thrilled."
- Sound like a real person, not a template.
- End with:
${profile.name}
${profile.email} · ${profile.website}`;
}

function buildUserPrompt(body: GenerateRequestBody): string {
  let prompt = `Write a cover letter for this role:

Title: ${body.jobTitle}
Company: ${body.company}
Category: ${body.category}

Job Description:
${body.jobDescription}`;

  if (body.existingLetters && body.existingLetters.length > 0) {
    prompt += `\n\nHere are cover letters already generated for other roles. Do NOT repeat them -- write something fresh and specific to this job:\n`;
    body.existingLetters.forEach((letter, i) => {
      prompt += `\n--- Existing letter ${i + 1} ---\n${letter}\n`;
    });
  }

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequestBody;

    if (!body.jobDescription || !body.jobTitle || !body.company || !body.profile) {
      return NextResponse.json(
        { error: "Missing required fields: jobDescription, jobTitle, company, profile" },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: buildSystemPrompt(body.profile),
      messages: [
        {
          role: "user",
          content: buildUserPrompt(body),
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    const coverLetter = textBlock ? textBlock.text : "";

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error("Cover letter generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
