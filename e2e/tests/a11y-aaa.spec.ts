import type { Page } from "@playwright/test";
import { expect, signIn, test } from "../fixtures";

/**
 * What axe cannot see. The AAA contrast and landmark rules run in a11y.spec.ts; this file covers the
 * criteria that need a real browser doing real things: target size (2.5.5), a skip link that works (2.4.1),
 * a visible focus indicator (2.4.7, 2.4.13) and reduced motion (2.3.3).
 */
const TARGET = 44;
/** Enough Tab presses to cover the header, its controls and the first cards of the page. */
const TAB_STOPS = 14;

const pages = [
  { name: "landing", path: "/", ready: "landing-stack" },
  { name: "blog", path: "/blog", ready: "content-grid" },
  { name: "pricing", path: "/pricing", ready: "pricing-grid" },
  { name: "sign in", path: "/auth/signin", ready: "signin-form" },
];

test.describe("pointer targets are at least 44 by 44 pixels", () => {
  const undersized = (page: Page) =>
    page.evaluate((min) => {
      const controls = document.querySelectorAll<HTMLElement>(
        'button, [role="button"], input:not([type="hidden"]), select, textarea, nav a, footer a, a[class*="Button"], a[data-slot="button"]',
      );
      const small: string[] = [];
      for (const el of controls) {
        if (el.closest('[aria-hidden="true"]') || el.closest(".joyride"))
          continue;
        // A checkbox or switch is operated through its label, which is the real target.
        const box = (el.closest("label") ?? el).getBoundingClientRect();
        const style = getComputedStyle(el);
        const visible =
          box.width > 0 &&
          box.height > 0 &&
          style.visibility !== "hidden" &&
          box.bottom > 0 &&
          box.top < document.documentElement.scrollHeight;
        const onScreen = box.right > 0 && box.left < window.innerWidth;
        if (
          visible &&
          onScreen &&
          (box.width < min - 0.5 || box.height < min - 0.5)
        )
          small.push(
            `${el.tagName.toLowerCase()}[${el.getAttribute("data-test-id") ?? el.textContent?.trim().slice(0, 24)}] ${Math.round(box.width)}x${Math.round(box.height)}`,
          );
      }
      return small;
    }, TARGET);

  for (const { name, path, ready } of pages) {
    test(name, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByTestId(ready).first()).toBeVisible();
      expect(await undersized(page)).toEqual([]);
    });
  }

  test("dashboard", async ({ page }) => {
    await signIn(page);
    await expect(page.getByTestId("stat-tile")).toHaveCount(4);
    expect(await undersized(page)).toEqual([]);
  });
});

test("the skip link is the first stop and moves focus past the header", async ({
  page,
}) => {
  await page.goto("/blog");
  await expect(page.getByTestId("content-grid")).toBeVisible();

  await page.keyboard.press("Tab");
  const skip = page.getByTestId("skip-link");
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();

  await page.keyboard.press("Enter");
  await expect(page.locator("#content")).toBeFocused();
  // The target is not a control, so it takes focus without drawing a ring around the whole page.
  await expect(page.locator("#content")).toHaveCSS("outline-style", "none");
  expect(new URL(page.url()).hash, "the URL is left alone").toBe("");

  await page.keyboard.press("Tab");
  const inContent = await page.evaluate(() =>
    document.getElementById("content")?.contains(document.activeElement),
  );
  expect(inContent, "the next Tab lands inside the content").toBe(true);
});

test("every control shows a focus indicator of at least 2px when tabbed to", async ({
  page,
}) => {
  await page.goto("/pricing");
  await expect(page.getByTestId("pricing-grid")).toBeVisible();

  const missing: string[] = [];
  for (let step = 0; step < TAB_STOPS; step += 1) {
    await page.keyboard.press("Tab");
    const indicator = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      const outline =
        s.outlineStyle !== "none" ? parseFloat(s.outlineWidth) : 0;
      // A ring is a shadow layer with no offset and no blur but a spread of 2px or more; elevation shadows do not count.
      const ring = [
        ...s.boxShadow.matchAll(/ 0px 0px 0px (\d+(?:\.\d+)?)px/g),
      ].some((m) => Number(m[1]) >= 2);
      return {
        name: el.getAttribute("data-test-id") ?? el.tagName.toLowerCase(),
        ok: outline >= 2 || ring,
      };
    });
    if (indicator && !indicator.ok) missing.push(indicator.name);
  }
  expect(missing).toEqual([]);
});

test("motion stops when the visitor prefers reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByTestId("landing-stack")).toBeVisible();
  const longest = await page.evaluate(() =>
    Math.max(
      0,
      ...document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => Number(a.effect?.getComputedTiming().duration ?? 0)),
    ),
  );
  expect(longest).toBeLessThanOrEqual(1);
});
