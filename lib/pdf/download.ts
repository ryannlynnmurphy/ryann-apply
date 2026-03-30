import type { Profile } from "@/lib/types";

export async function downloadPdf(
  type: "cover-letter" | "resume",
  content: string,
  profile: Profile
) {
  const res = await fetch("/api/generate-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      content,
      profile: {
        name: profile.name,
        email: profile.email,
        website: profile.website,
        github: profile.github,
        linkedin: profile.linkedin,
        location: profile.location,
        languages: profile.languages,
      },
    }),
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `RyannMurphy_${type === "cover-letter" ? "CoverLetter" : "Resume"}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
