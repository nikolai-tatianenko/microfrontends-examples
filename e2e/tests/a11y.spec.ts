import { expectNoA11yViolations } from "../a11y";
import { expect, signIn, test } from "../fixtures";

/**
 * Automated WCAG 2.1 A/AA scan of every key screen in both color schemes (contrast differs between them).
 * Automation finds roughly a third of accessibility problems; keyboard and screen-reader behaviour still
 * need a human, but regressions in the machine-checkable third now fail CI.
 */
const pages: Array<{ name: string; path: string; ready: string }> = [
  { name: "landing (shadcn remote)", path: "/", ready: "landing-stack" },
  { name: "blog", path: "/blog", ready: "content-grid" },
  { name: "pricing", path: "/pricing", ready: "pricing-grid" },
  { name: "about", path: "/about", ready: "heading" },
  { name: "not found", path: "/definitely-not-a-page", ready: "heading" },
  { name: "sign in", path: "/auth/signin", ready: "signin-form" },
  { name: "sign up", path: "/auth/signup", ready: "signup-form" },
];

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`a11y · ${colorScheme}`, () => {
    test.use({ colorScheme });

    for (const { name, path, ready } of pages) {
      test(name, async ({ page }) => {
        await page.goto(path);
        await expect(page.getByTestId(ready).first()).toBeVisible();
        await expectNoA11yViolations(page);
      });
    }

    test("dashboard (Vue remote)", async ({ page }) => {
      await signIn(page);
      await expect(page.getByTestId("stat-tile")).toHaveCount(4);
      await expectNoA11yViolations(page);
    });

    test("sign-in form with validation errors", async ({ page }) => {
      await page.goto("/auth/signin");
      await page.getByTestId("submit").click();
      await expect(
        page.getByText("Enter a valid email address."),
      ).toBeVisible();
      await expectNoA11yViolations(page);
    });
  });
}
