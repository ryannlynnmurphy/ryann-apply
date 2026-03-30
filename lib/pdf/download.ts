import type { Profile } from "@/lib/types";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildCoverLetterHtml(content: string, profile: Profile): string {
  const contactParts = [profile.email, profile.website, profile.github, profile.linkedin].filter(Boolean).join("  |  ");
  const paragraphs = content.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  const bodyHtml = paragraphs.map(p => `<p style="margin:0 0 12px 0;font-size:11pt;color:#2D2A26;line-height:1.65;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`).join("");

  return `<!DOCTYPE html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<style>
@page { size: A4; margin: 1in; }
body { font-family: 'DM Sans', sans-serif; margin: 0; padding: 0; color: #2D2A26; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
</style></head><body>
<div style="font-family:'Playfair Display',serif;font-size:18pt;font-weight:700;color:#2D2A26;margin-bottom:4px;">${escapeHtml(profile.name)}</div>
<div style="font-size:9pt;color:#5C5852;margin-bottom:14px;">${escapeHtml(contactParts)}</div>
<hr style="border:none;border-top:1px solid #C9A96E;margin-bottom:22px;"/>
${bodyHtml}
<div style="position:fixed;bottom:40px;right:72px;font-size:7pt;color:#C9A96E;font-family:'DM Sans',sans-serif;">HZL</div>
</body></html>`;
}

function buildResumeHtml(content: string, profile: Profile): string {
  const contactParts = [profile.email, profile.website, profile.github, profile.linkedin].filter(Boolean).join("  |  ");
  const locationLang = [profile.location, profile.languages?.join(", ")].filter(Boolean).join("  |  ");

  const sections = content.split(/\n(?=(?:SUMMARY|EXPERIENCE|PROJECTS|EDUCATION|SKILLS)\s*\n?)/);
  let bodyHtml = "";

  for (const section of sections) {
    const lines = section.split("\n");
    const header = lines[0]?.trim();

    if (["SUMMARY", "EXPERIENCE", "PROJECTS", "EDUCATION", "SKILLS"].includes(header)) {
      bodyHtml += `<div style="font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#2D2A26;margin-top:16px;margin-bottom:4px;border-bottom:0.5px solid #CCC7BF;padding-bottom:3px;">${header}</div>`;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        if (line.startsWith("- ")) {
          bodyHtml += `<div style="font-size:9.5pt;color:#2D2A26;line-height:1.55;padding-left:12px;margin-bottom:2px;"><span style="color:#C9A96E;margin-right:6px;">&#9679;</span>${escapeHtml(line.slice(2))}</div>`;
        } else if (line.includes(" -- ") || line.includes(" | ")) {
          bodyHtml += `<div style="font-size:9.5pt;font-weight:600;color:#2D2A26;margin-top:8px;margin-bottom:2px;">${escapeHtml(line)}</div>`;
        } else {
          bodyHtml += `<div style="font-size:9.5pt;color:#2D2A26;line-height:1.55;margin-bottom:2px;">${escapeHtml(line)}</div>`;
        }
      }
    }
  }

  return `<!DOCTYPE html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
@page { size: A4; margin: 0.75in; }
body { font-family: 'DM Sans', sans-serif; margin: 0; padding: 0; color: #2D2A26; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
</style></head><body>
<div style="text-align:center;font-family:'Playfair Display',serif;font-size:20pt;font-weight:700;color:#2D2A26;margin-bottom:4px;">${escapeHtml(profile.name.toUpperCase())}</div>
<div style="text-align:center;font-size:9pt;color:#5C5852;margin-bottom:2px;">${escapeHtml(contactParts)}</div>
<div style="text-align:center;font-size:9pt;color:#5C5852;margin-bottom:12px;">${escapeHtml(locationLang)}</div>
<hr style="border:none;border-top:1px solid #C9A96E;margin-bottom:14px;"/>
${bodyHtml}
<div style="position:fixed;bottom:30px;right:54px;font-size:7pt;color:#C9A96E;">HZL</div>
</body></html>`;
}

export async function downloadPdf(
  type: "cover-letter" | "resume",
  content: string,
  profile: Profile
) {
  const html = type === "cover-letter"
    ? buildCoverLetterHtml(content, profile)
    : buildResumeHtml(content, profile);

  // Open a new window, write the HTML, wait for fonts, then print to PDF
  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow popups to download PDFs.");
    return;
  }
  win.document.write(html);
  win.document.close();

  // Wait for fonts to load then trigger print dialog (Save as PDF)
  setTimeout(() => {
    win.focus();
    win.print();
  }, 1500);
}
