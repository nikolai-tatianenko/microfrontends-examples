import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "../a11y";

/**
 * One baseline, one accessibility scan (axe, WCAG 2.1 A/AA) and one row in the PR report per Storybook story: the design system is
 * regression-tested without writing a test per component. Add a story, get a visual test.
 * Needs `pnpm --filter @blog/ui build-storybook` (the `visual` script does it).
 */
interface Entry {
  id: string;
  title: string;
  name: string;
  type: "story" | "docs";
}

const index = resolve(process.cwd(), "packages/ui/storybook-static/index.json");
const stories = Object.values(
  (
    JSON.parse(readFileSync(index, "utf8")) as {
      entries: Record<string, Entry>;
    }
  ).entries,
).filter((entry) => entry.type === "story");

test.use({ viewport: { width: 800, height: 600 } });

for (const story of stories) {
  test(`${story.title} · ${story.name}`, async ({ page }) => {
    await page.goto(`/_storybook/iframe.html?id=${story.id}&viewMode=story`);
    await page.locator("#storybook-root > *").first().waitFor();
    await expectNoA11yViolations(page, "#storybook-root");
    await expect(page).toHaveScreenshot(`${story.id}.png`, {
      animations: "disabled",
    });
  });
}
