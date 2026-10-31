import { DEMO_USER, expect, signIn, test } from "../fixtures";

test.describe("auth remote + dashboard remote", () => {
  test("a signed-out visitor is sent from /dashboard to the sign-in form", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/auth/signin");
    await expect(page.getByTestId("signin-form")).toBeVisible();
  });

  test("signing in lands on the Vue dashboard with data from GraphQL", async ({
    page,
  }) => {
    await signIn(page);

    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.getByText(`Signed in as ${DEMO_USER.email}`),
    ).toBeVisible();
    await expect(page.getByTestId("stat-tile")).toHaveCount(4);
    await expect(
      page.getByTestId("activity-list").getByRole("listitem"),
    ).toHaveCount(3);
    await expect(page.getByTestId("header-logout")).toBeVisible();
  });

  test("the demo account on the sign-in form fills it and signs in", async ({
    page,
  }) => {
    await page.goto("/auth/signin");
    await page.getByTestId("demo-fill").click();
    await page.getByTestId("submit").click();

    await expect(page).toHaveURL("/dashboard");
    await expect(
      page.getByText(`Signed in as ${DEMO_USER.email}`),
    ).toBeVisible();
  });

  test("the session survives a reload", async ({ page }) => {
    await signIn(page);
    await page.reload();
    await expect(page.getByTestId("dashboard")).toBeVisible();
  });

  test("logging out returns home and re-guards the dashboard", async ({
    page,
  }) => {
    await signIn(page);
    await page.getByTestId("header-logout").click();

    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("header-login")).toBeVisible();

    await page.goto("/dashboard");
    await expect(page).toHaveURL("/auth/signin");
  });

  test("wrong credentials show the server's message and do not sign in", async ({
    page,
  }) => {
    await page.goto("/auth/signin");
    await page.getByTestId("email").fill(DEMO_USER.email);
    await page.getByTestId("password").fill("wrong-password");
    await page.getByTestId("submit").click();

    await expect(page.getByTestId("form-error")).toHaveText(
      "Invalid email or password.",
    );
    await expect(page).toHaveURL("/auth/signin");
  });

  test("client-side validation blocks an empty submit without calling the API", async ({
    page,
  }) => {
    let calls = 0;
    await page.route("**/graphql", (route) => {
      calls += 1;
      return route.continue();
    });
    await page.goto("/auth/signin");
    await page.getByTestId("submit").click();

    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    await expect(
      page.getByText("Password must be at least 8 characters."),
    ).toBeVisible();
    expect(calls).toBe(0);
  });

  test("sign up creates an account and signs it in", async ({ page }) => {
    await page.goto("/auth/signup");
    await page.getByTestId("email").fill(`new-${Date.now()}@example.com`);
    await page.getByTestId("password").fill("a-strong-password");
    await page.getByTestId("submit").click();
    await expect(page.getByTestId("dashboard")).toBeVisible();
  });

  test("the header Login button opens the sign-in form, and the form links to sign-up", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("header-login").click();
    await expect(page).toHaveURL("/auth/signin");
    await page.getByRole("link", { name: /Sign Up/ }).click();
    await expect(page).toHaveURL("/auth/signup");
  });
});
