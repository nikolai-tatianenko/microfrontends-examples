import type { Page } from "@playwright/test";
import { expectNoA11yViolations } from "../a11y";
import { expect, test } from "../fixtures";

// The tour is the first thing a new visitor meets, so these tests are that visitor.
test.use({ tourSeen: false });

const tooltip = (page: Page) => page.locator("#react-joyride-portal");

test.describe("guided tour", () => {
  test("opens by itself on a first visit and walks through three different micro-apps", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(tooltip(page)).toContainText("One shell, many apps");

    await page.getByRole("button", { name: /Next \(1 of 5\)/ }).click();
    await expect(tooltip(page)).toContainText("See who renders what");

    await page.getByRole("button", { name: /Next \(2 of 5\)/ }).click();
    await expect(tooltip(page)).toContainText("A Vite-built remote");
    await expect(page).toHaveURL("/");

    // The next two steps cross into other remotes, which load on demand.
    await page.getByRole("button", { name: /Next \(3 of 5\)/ }).click();
    await expect(tooltip(page)).toContainText(
      "Data through one GraphQL client",
    );
    await expect(page).toHaveURL("/blog");

    await page.getByRole("button", { name: /Next \(4 of 5\)/ }).click();
    await expect(tooltip(page)).toContainText("Now try the demo account");
    await expect(page).toHaveURL("/auth/signin");

    await page.getByRole("button", { name: "Finish" }).click();
    await expect(tooltip(page)).toHaveCount(0);
    await expect(page.getByTestId("signin-form")).toBeVisible();
  });

  test("goes back to an earlier remote's page when the visitor presses Back", async ({
    page,
  }) => {
    await page.goto("/");
    for (let step = 1; step <= 3; step += 1) {
      await page
        .getByRole("button", { name: new RegExp(`Next \\(${step} of 5\\)`) })
        .click();
    }
    await expect(page).toHaveURL("/blog");

    await page.getByRole("button", { name: "Back" }).click();

    await expect(page).toHaveURL("/");
    await expect(tooltip(page)).toContainText("A Vite-built remote");
  });

  test("is offered once: a reload does not open it again, the header button does", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(tooltip(page)).toContainText("One shell, many apps");
    await page.getByRole("button", { name: "Skip tour" }).click();
    await expect(tooltip(page)).toHaveCount(0);

    await page.reload();
    await expect(page.getByTestId("landing-stack")).toBeVisible();
    await expect(tooltip(page)).toHaveCount(0);

    await page.getByTestId("tour-start").click();
    await expect(tooltip(page)).toContainText("One shell, many apps");
  });

  for (const colorScheme of ["light", "dark"] as const) {
    test(`has no automatically detectable accessibility violations while open · ${colorScheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto("/");
      await expect(tooltip(page)).toContainText("One shell, many apps");
      await expectNoA11yViolations(page);
    });
  }
});
