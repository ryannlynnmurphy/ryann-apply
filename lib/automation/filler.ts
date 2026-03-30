import puppeteer, { Page } from "puppeteer";
import { Profile, FormField } from "../types";

export async function detectFormFields(url: string): Promise<FormField[]> {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });

    const fields = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >(
          'input[type="text"], input[type="email"], input[type="tel"], input[type="url"], textarea, select'
        )
      );

      return elements.map((el) => {
        const label =
          (el.labels && el.labels[0]?.textContent?.trim()) ||
          el.getAttribute("aria-label") ||
          el.getAttribute("placeholder") ||
          el.getAttribute("name") ||
          el.id ||
          "";

        let type: "text" | "textarea" | "select" | "file" | "checkbox" =
          "text";
        if (el.tagName === "TEXTAREA") type = "textarea";
        else if (el.tagName === "SELECT") type = "select";

        return {
          name: label,
          type,
          required: el.required,
        };
      });
    });

    return fields;
  } finally {
    await browser.close();
  }
}

export async function fillForm(
  url: string,
  profile: Profile,
  coverLetter: string
): Promise<{ success: boolean; page: Page; browser: ReturnType<typeof puppeteer.launch> extends Promise<infer B> ? B : never }> {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });

  const fieldMap: Record<string, string> = {
    name: profile.name,
    full_name: profile.name,
    first_name: profile.name.split(" ")[0],
    last_name: profile.name.split(" ").slice(1).join(" "),
    email: profile.email,
    phone: profile.phone,
    linkedin: profile.linkedin,
    github: profile.github,
    website: profile.website,
    portfolio: profile.website,
    location: profile.location,
    city: profile.location,
    cover_letter: coverLetter,
  };

  for (const [key, value] of Object.entries(fieldMap)) {
    if (!value) continue;

    const selector = [
      `input[name*="${key}" i]`,
      `textarea[name*="${key}" i]`,
      `input[id*="${key}" i]`,
      `textarea[id*="${key}" i]`,
      `input[placeholder*="${key}" i]`,
    ].join(", ");

    try {
      const el = await page.$(selector);
      if (el) {
        await el.click({ clickCount: 3 });
        await el.type(value, { delay: 20 });
      }
    } catch {
      // Field not found or not interactable; skip
    }
  }

  return { success: true, page, browser };
}
