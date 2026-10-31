import { expect, signIn, test } from "../fixtures";

// Pin "now" so the footer year and any relative dates never change a baseline.
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-06-01T12:00:00Z"));
});

const schemes = ["light", "dark"] as const;

for (const scheme of schemes) {
  test.describe(`${scheme} theme`, () => {
    test.use({ colorScheme: scheme });

    test(`landing page (shadcn remote) · ${scheme}`, async ({ page }) => {
      await page.goto("/");
      await expect(page.getByTestId("landing-stack")).toBeVisible();
      await expect(page).toHaveScreenshot(`landing-${scheme}.png`, {
        fullPage: true,
      });
    });

    test(`blog page · ${scheme}`, async ({ page }) => {
      await page.goto("/blog");
      await expect(page.getByTestId("blog-post-item")).toHaveCount(6);
      await expect(page).toHaveScreenshot(`blog-${scheme}.png`, {
        fullPage: true,
      });
    });

    test(`pricing page · ${scheme}`, async ({ page }) => {
      await page.goto("/pricing");
      await expect(page.getByTestId("plan-pro")).toBeVisible();
      await expect(page).toHaveScreenshot(`pricing-${scheme}.png`, {
        fullPage: true,
      });
    });

    test(`sign-in form · ${scheme}`, async ({ page }) => {
      await page.goto("/auth/signin");
      await expect(page.getByTestId("signin-form")).toBeVisible();
      await expect(page).toHaveScreenshot(`signin-${scheme}.png`);
    });

    test(`dashboard (Vue remote) · ${scheme}`, async ({ page }) => {
      await signIn(page);
      await expect(page.getByTestId("stat-tile")).toHaveCount(4);
      await expect(page).toHaveScreenshot(`dashboard-${scheme}.png`, {
        fullPage: true,
      });
    });
  });
}

test("sign-in form validation state", async ({ page }) => {
  await page.goto("/auth/signin");
  await page.getByTestId("submit").click();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(page).toHaveScreenshot("signin-invalid.png");
});

test("mobile layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/pricing");
  await expect(page.getByTestId("plan-pro")).toBeVisible();
  await expect(page).toHaveScreenshot("pricing-mobile.png", { fullPage: true });
});
