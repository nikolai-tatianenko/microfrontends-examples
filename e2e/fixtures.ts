import { expect, test as base, type Page } from "@playwright/test";

/**
 * Every test fails on unexpected browser errors (console.error, uncaught exceptions),
 * so a green run also means a clean console. Tests that provoke errors on purpose
 * declare them with `allowedErrors`.
 *
 * The guided tour opens by itself on a first visit and would cover every other test's page, so visitors are
 * "returning" unless a test sets `tourSeen: false`.
 */
export const test = base.extend<{ allowedErrors: RegExp; tourSeen: boolean }>({
  allowedErrors: [/(?!)/, { option: true }], // never matches: nothing is allowed by default
  tourSeen: [true, { option: true }],
  page: async ({ page, allowedErrors, tourSeen }, use) => {
    if (tourSeen)
      await page.addInitScript(() => localStorage.setItem("mf-tour-seen", "1"));
    const errors: string[] = [];
    page.on(
      "console",
      (message) => message.type() === "error" && errors.push(message.text()),
    );
    page.on("pageerror", (error) => errors.push(error.message));

    await use(page);

    const unexpected = errors.filter((text) => !allowedErrors.test(text));
    expect(unexpected, "unexpected browser errors").toEqual([]);
  },
});

export { expect };

export const DEMO_USER = { email: "demo@example.com", password: "password123" };

/** Signs in through the real auth remote and waits for the dashboard. */
export async function signIn(page: Page) {
  await page.goto("/auth/signin");
  await page.getByTestId("email").fill(DEMO_USER.email);
  await page.getByTestId("password").fill(DEMO_USER.password);
  await page.getByTestId("submit").click();
  await expect(page.getByTestId("dashboard")).toBeVisible();
}
