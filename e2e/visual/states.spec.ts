import { expect, test } from "@playwright/test";

/**
 * Interactive states are not stories of their own (a story cannot be "hovered"), so the Controls gallery is driven here:
 * hover, keyboard focus and the resting state of the controls, in both color modes. These are the states a token or
 * theme change breaks first, and a page-level screenshot never reaches them.
 */
test.use({ viewport: { width: 800, height: 700 } });

const gallery =
  "/_storybook/iframe.html?id=foundations-controls--all-states&viewMode=story";

for (const mode of ["light", "dark"] as const) {
  test.describe(`controls · ${mode}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${gallery}&globals=theme:${mode}`);
      await page.getByTestId("state-contained").waitFor();
    });

    test("hovered button", async ({ page }) => {
      await page.getByTestId("state-contained").hover();
      await expect(page).toHaveScreenshot(`controls-hover-${mode}.png`, {
        animations: "disabled",
      });
    });

    test("keyboard focus on the first button", async ({ page }) => {
      await page.keyboard.press("Tab");
      await expect(page.getByTestId("state-contained")).toBeFocused();
      await expect(page).toHaveScreenshot(`controls-focus-${mode}.png`, {
        animations: "disabled",
      });
    });

    test("keyboard focus on a text button", async ({ page }) => {
      for (let tab = 0; tab < 3; tab += 1) await page.keyboard.press("Tab");
      await expect(page.getByTestId("state-text")).toBeFocused();
      await expect(page).toHaveScreenshot(`controls-focus-text-${mode}.png`, {
        animations: "disabled",
      });
    });
  });
}
