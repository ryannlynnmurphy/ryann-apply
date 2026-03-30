import { Profile } from "../types";
import { fillForm } from "./filler";

export interface AutoApplyResult {
  success: boolean;
  error?: string;
}

export async function autoApply(
  url: string,
  profile: Profile,
  coverLetter: string,
  autoSubmit: boolean
): Promise<AutoApplyResult> {
  try {
    const { success, page, browser } = await fillForm(
      url,
      profile,
      coverLetter
    );

    if (!success) {
      await browser.close();
      return { success: false, error: "Failed to fill form" };
    }

    if (autoSubmit) {
      // Try common submit button selectors in priority order
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
      ];

      let clicked = false;

      for (const selector of submitSelectors) {
        try {
          const el = await page.$(selector);
          if (el) {
            await el.click();
            clicked = true;
            break;
          }
        } catch {
          // Try next selector
        }
      }

      // Fall back to buttons containing "Submit" or "Apply" text
      if (!clicked) {
        try {
          const buttonHandle = await page.evaluateHandle(() => {
            const buttons = Array.from(
              document.querySelectorAll("button")
            );
            return buttons.find((btn) => {
              const text = btn.textContent?.toLowerCase() ?? "";
              return text.includes("submit") || text.includes("apply");
            });
          });

          const element = buttonHandle.asElement();
          if (element) {
            await (element as unknown as { click(): Promise<void> }).click();
          }
        } catch {
          // No matching button found
        }
      }

      await browser.close();
    }
    // If not autoSubmit, leave browser open for user review

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
