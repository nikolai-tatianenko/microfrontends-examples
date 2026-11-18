import type { Page } from "@playwright/test";
import { expect, signIn, test } from "../fixtures";
import { tokens } from "../../packages/tokens/src/generated/tokens";

// The shell owns the color mode; every remote, in whatever framework, follows it. These tests are the visitor
// flipping the switch and looking at each remote.
// Expected colors come from the tokens, not from copies of them, so a token edit cannot leave this file behind.
const rgb = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) =>
    Number.parseInt(hex.slice(i, i + 2), 16),
  );
  return `rgb(${r}, ${g}, ${b})`;
};
const SURFACE = {
  light: rgb(tokens.light.color.surface.default),
  dark: rgb(tokens.dark.color.surface.default),
};
const RAISED = {
  light: rgb(tokens.light.color.surface.raised),
  dark: rgb(tokens.dark.color.surface.raised),
};

const backgroundOf = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor);

const onPage = (page: Page) =>
  page.evaluate(() => document.documentElement.getAttribute("data-theme"));

test.describe("color mode", () => {
  test("follows the operating system until the visitor chooses", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.getByTestId("theme-system")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(await onPage(page)).toBe("dark");

    await page.emulateMedia({ colorScheme: "light" });
    await expect.poll(() => onPage(page)).toBe("light");
  });

  // Blocking the scripts is the point of the test, so the failed loads are expected.
  test.describe("with scripts blocked", () => {
    test.use({ allowedErrors: /Failed to load resource/ });

    test("a saved choice is on the page before any script runs, so there is no flash of the other mode", async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: "light" });
      await page.addInitScript(() => localStorage.setItem("blog.mode", "dark"));
      await page.route("**/*.js", (route) => route.abort());
      await page.goto("/", { waitUntil: "domcontentloaded" });
      expect(await onPage(page)).toBe("dark");
    });
  });

  test("an explicit choice beats the OS, survives a reload and can be undone", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await page.getByTestId("theme-dark").click();
    expect(await onPage(page)).toBe("dark");

    await page.reload();
    await expect(page.getByTestId("theme-dark")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(await onPage(page)).toBe("dark");

    await page.getByTestId("theme-system").click();
    expect(await onPage(page)).toBe("light");
  });

  test("repaints the React/MUI shell, the shadcn landing remote, the MUI remotes and the Vue dashboard from one switch", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.getByTestId("landing-stack")).toBeVisible();
    expect(await backgroundOf(page, ".landing-root")).toBe(SURFACE.light);

    await page.getByTestId("theme-dark").click();
    // Tailwind / shadcn remote: custom properties only, no JavaScript of its own.
    expect(await backgroundOf(page, ".landing-root")).toBe(SURFACE.dark);
    // The shell's own MUI theme.
    expect(await backgroundOf(page, "body")).toBe(SURFACE.dark);

    // A MUI remote, loaded after the switch, comes up dark without being told.
    await page.getByTestId("header-nav-pricing").click();
    await expect(page.getByTestId("plan-pro")).toBeVisible();
    expect(await backgroundOf(page, '[data-test-id="plan-pro"]')).toBe(
      RAISED.dark,
    );

    // The Vue remote.
    await signIn(page);
    await expect(page.getByTestId("stat-tile")).toHaveCount(4);
    expect(await backgroundOf(page, '[data-test-id="stat-tile"]')).toBe(
      RAISED.dark,
    );

    // Back to light, live: a remote that is already mounted follows without a reload.
    await page.getByTestId("theme-light").click();
    expect(await backgroundOf(page, '[data-test-id="stat-tile"]')).toBe(
      RAISED.light,
    );
  });

  test("a mounted MUI remote changes theme live, not only on load", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/pricing");
    await expect(page.getByTestId("plan-pro")).toBeVisible();
    expect(await backgroundOf(page, '[data-test-id="plan-pro"]')).toBe(
      RAISED.light,
    );
    await page.getByTestId("theme-dark").click();
    await expect
      .poll(() => backgroundOf(page, '[data-test-id="plan-pro"]'))
      .toBe(RAISED.dark);
  });
});

test.describe("forced colors (Windows high contrast)", () => {
  test.use({ colorScheme: "light" });

  test("the color tokens hand over to system colors", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/");
    const value = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--bd-color-surface-default")
        .trim(),
    );
    expect(value).toBe("Canvas");
  });

  test("system colors win over a chosen dark mode too", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/");
    await page.getByTestId("theme-dark").click();
    expect(await onPage(page)).toBe("dark");
    const value = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--bd-color-surface-default")
        .trim(),
    );
    expect(value).toBe("Canvas");
  });

  test("keyboard focus stays visible", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/pricing");
    await expect(page.getByTestId("plan-pro")).toBeVisible();
    await page.keyboard.press("Tab"); // the skip link
    await page.keyboard.press("Tab"); // the first control after it
    const ring = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement as Element);
      return {
        style: style.outlineStyle,
        width: Number.parseFloat(style.outlineWidth),
      };
    });
    expect(ring.style).not.toBe("none");
    expect(ring.width).toBeGreaterThanOrEqual(2);
  });
});
