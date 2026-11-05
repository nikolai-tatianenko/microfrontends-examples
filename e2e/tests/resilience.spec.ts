import { expect, signIn, test } from "../fixtures";

// A dead remote logs failed requests / chunk errors on purpose.
test.use({
  allowedErrors:
    /Failed to load resource|ERR_FAILED|ChunkLoadError|Loading script failed|remoteEntry|Federation Runtime|RUNTIME-008|GraphQL|Network/i,
});

test.describe("failure isolation", () => {
  test("a Vite-built remote recovers from an outage without a reload", async ({
    page,
  }) => {
    let down = true;
    await page.route("**/_remotes/landing/**", (route) =>
      down ? route.abort() : route.continue(),
    );

    await page.goto("/");
    await expect(page.getByTestId("error-state")).toContainText(
      "The landing module is unavailable",
    );
    await expect(page.getByTestId("header")).toBeVisible();

    down = false;
    await page.getByTestId("error-state-retry").click();
    await expect(page.getByTestId("landing-stack")).toBeVisible();
  });

  test("a remote that is down shows a contained, retryable error; the shell and other remotes keep working", async ({
    page,
  }) => {
    let down = true;
    await page.route("**/_remotes/auth/**", (route) =>
      down ? route.abort() : route.continue(),
    );

    await page.goto("/auth/signin");
    await expect(page.getByTestId("error-state")).toContainText(
      "The auth module is unavailable",
    );
    await expect(page.getByTestId("header")).toBeVisible();

    // Other remotes are unaffected.
    await page.getByTestId("header-brand").click();
    await expect(page.getByTestId("landing-stack")).toBeVisible();

    // Recovery without a full reload.
    await page.goBack();
    await expect(page.getByTestId("error-state")).toContainText(
      "The auth module is unavailable",
    ); // still down
    down = false;
    await page.getByTestId("error-state-retry").click();
    await expect(page.getByTestId("signin-form")).toBeVisible();
  });

  test("a GraphQL outage shows an inline error with retry instead of a blank page", async ({
    page,
  }) => {
    let down = true;
    await page.route("**/graphql", (route) =>
      down ? route.fulfill({ status: 500, body: "boom" }) : route.continue(),
    );

    await page.goto("/blog");
    await expect(page.getByTestId("error-state")).toBeVisible();

    down = false;
    await page.getByTestId("error-state-retry").click();
    await expect(page.getByTestId("blog-post-item")).toHaveCount(6);
  });

  test("a GraphQL outage on the Vue dashboard shows its own error with retry", async ({
    page,
  }) => {
    await signIn(page);
    let down = true;
    await page.route("**/graphql", (route) =>
      down ? route.fulfill({ status: 500, body: "boom" }) : route.continue(),
    );

    await page.reload();
    await expect(page.getByTestId("dashboard-error")).toBeVisible();
    // The shell around the remote is unaffected.
    await expect(page.getByTestId("header")).toBeVisible();

    down = false;
    await page.getByTestId("dashboard-retry").click();
    await expect(page.getByTestId("dashboard-error")).toHaveCount(0);
    await expect(page.getByTestId("dashboard")).toContainText(
      "Recent activity",
    );
  });
});
