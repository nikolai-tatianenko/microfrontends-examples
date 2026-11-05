import { expect, test } from "../fixtures";

test.describe("marketing remote", () => {
  test("renders posts fetched over GraphQL", async ({ page }) => {
    await page.goto("/blog");
    await expect(
      page.getByRole("heading", { name: "Main Page" }),
    ).toBeVisible();
    await expect(page.getByTestId("blog-post-item")).toHaveCount(6);
    await expect(
      page.getByRole("heading", { name: "Shipping a shell" }),
    ).toBeVisible();
  });

  test("the landing remote (shadcn/ui + Tailwind) opens on / and leads into the other remotes", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: /independent teams/ }),
    ).toBeVisible();
    await expect(page.getByTestId("landing-app-dashboard")).toContainText(
      "Vue 3",
    );

    await page.getByTestId("landing-cta-blog").click();
    await expect(page).toHaveURL("/blog");
    await expect(page.getByTestId("blog-post-item")).toHaveCount(6);

    await page.goBack();
    await page.getByTestId("landing-cta-start").click();
    await expect(page).toHaveURL("/auth/signup");
    await expect(page.getByTestId("signup-form")).toBeVisible();
  });

  test("the landing page shows its hero and pillars, and its other calls to action lead on", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("landing-hero")).toBeVisible();
    await expect(
      page.getByTestId("landing-pillars").getByRole("listitem"),
    ).toHaveCount(3);

    await page.getByTestId("landing-cta-pricing").click();
    await expect(page).toHaveURL("/pricing");
    await expect(page.getByTestId("pricing-grid")).toBeVisible();

    await page.goto("/");
    await page.getByTestId("landing-cta-signin").click();
    await expect(page).toHaveURL("/auth/signin");
    await expect(page.getByTestId("signin-form")).toBeVisible();
  });

  test("the top menu reaches every section and marks the current page", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("header-nav-home")).toHaveAttribute(
      "aria-current",
      "page",
    );

    await page.getByTestId("header-nav-blog").click();
    await expect(page).toHaveURL("/blog");
    await expect(page.getByTestId("blog-post-item")).toHaveCount(6);
    await expect(page.getByTestId("header-nav-blog")).toHaveAttribute(
      "aria-current",
      "page",
    );

    await page.getByTestId("header-nav-pricing").click();
    await expect(page.getByTestId("plan-pro")).toBeVisible();

    await page.getByTestId("header-nav-about").click();
    await expect(page).toHaveURL("/about");
    await expect(page.getByTestId("header-nav-dashboard")).toHaveCount(0);
  });

  test("names the app that owns each region, per remote, and can hide the labels", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("owner-tag-shell")).toHaveText(
      "shell · React 19 host",
    );
    await expect(page.getByTestId("owner-tag-landing")).toHaveText(
      "landing · React 19 · shadcn/ui remote",
    );

    await page.goto("/blog");
    await expect(page.getByTestId("owner-tag-marketing")).toHaveText(
      "marketing · React 19 remote",
    );

    await page.goto("/auth/signin");
    await expect(page.getByTestId("owner-tag-auth")).toHaveText(
      "auth · React 19 remote",
    );

    await page.getByTestId("owners-toggle").uncheck();
    await expect(page.getByTestId("owner-tag-auth")).toHaveCount(0);
    await expect(page.getByTestId("signin-form")).toBeVisible();
  });

  test("navigates to pricing, keeping the shell URL and browser history in sync", async ({
    page,
  }) => {
    await page.goto("/blog");
    await page.getByTestId("cta-pricing").click();

    await expect(page).toHaveURL("/pricing");
    await expect(page.getByTestId("pricing-grid")).toBeVisible();
    await expect(page.getByTestId("plan-pro")).toContainText("$15");

    await page.goBack();
    await expect(page).toHaveURL("/blog");
    await expect(page.getByTestId("content-grid")).toBeVisible();
  });

  test("the Vite-built landing remote shares the host's React instead of loading its own", async ({
    page,
  }) => {
    const requested: string[] = [];
    page.on("request", (request) =>
      requested.push(new URL(request.url()).pathname),
    );

    await page.goto("/");
    await expect(page.getByTestId("landing-stack")).toBeVisible();

    const remotes = new Set(
      requested
        .map((p) => p.match(/^\/_remotes\/([^/]+)\//)?.[1])
        .filter(Boolean),
    );
    expect([...remotes]).toEqual(["landing"]);
    expect(
      requested.filter((p) =>
        /^\/_remotes\/landing\/assets\/react(-dom)?-[^/]+\.js$/.test(p),
      ),
      "a second copy of React would break hooks across the host/remote boundary",
    ).toEqual([]);
  });

  test("a page only fetches the remotes it uses", async ({ page }) => {
    const remotesRequested = new Set<string>();
    page.on("request", (request) => {
      const match = new URL(request.url()).pathname.match(
        /^\/_remotes\/([^/]+)\//,
      );
      if (match) remotesRequested.add(match[1]!);
    });

    await page.goto("/about");
    await expect(
      page.getByRole("heading", { name: "About", level: 1 }),
    ).toBeVisible();

    expect([...remotesRequested]).toEqual(["marketing"]);
  });

  test("deep links load the right page", async ({ page }) => {
    await page.goto("/about");
    await expect(
      page.getByRole("heading", { name: "About", level: 1 }),
    ).toBeVisible();
  });

  test("unknown paths get a not-found page, not a blank screen", async ({
    page,
  }) => {
    await page.goto("/definitely-not-a-page");
    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
  });

  test("the not-found page leads back home", async ({ page }) => {
    await page.goto("/definitely-not-a-page");
    await page.getByTestId("not-found-home").click();
    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("landing")).toBeVisible();
  });

  test("every pricing plan is listed", async ({ page }) => {
    await page.goto("/pricing");
    for (const plan of ["free", "pro", "team"])
      await expect(page.getByTestId(`plan-${plan}`)).toBeVisible();
  });

  test("footer links navigate within the marketing remote", async ({
    page,
  }) => {
    await page.goto("/blog");
    await page
      .getByRole("navigation", { name: "Footer" })
      .getByRole("link", { name: "Pricing" })
      .click();
    await expect(page).toHaveURL("/pricing");
  });
});
