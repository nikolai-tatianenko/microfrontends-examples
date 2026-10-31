import { UiProvider } from "@blog/ui";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Shell } from "./Shell";
import { fakeRemote, fakeServices, registryOf } from "./test-utils";

/**
 * Integration: the real Shell, router, guard, header and RemoteHost wired to fake remotes.
 * Verifies the host<->remote contract end to end without a browser.
 */
function setup(route: string, autoStartTour = false) {
  const services = fakeServices();
  const marketing = fakeRemote(
    (el) => void (el.textContent = "marketing page"),
  );
  const dashboard = fakeRemote(
    (el, { services: s }) =>
      void (el.textContent = `dashboard for ${s.session.getUser()?.email}`),
  );
  const auth = fakeRemote((el) => void (el.textContent = "auth form"));
  const landing = fakeRemote((el) => void (el.textContent = "landing page"));
  render(
    <MemoryRouter initialEntries={[route]}>
      <UiProvider mode="light">
        <Shell
          services={services}
          autoStartTour={autoStartTour}
          remotes={registryOf({
            marketing: marketing.mount,
            auth: auth.mount,
            dashboard: dashboard.mount,
            landing: landing.mount,
          })}
        />
      </UiProvider>
    </MemoryRouter>,
  );
  return { services, marketing, auth, dashboard, landing };
}

describe("Shell (integration)", () => {
  it("serves the landing remote on / and marketing everywhere else", async () => {
    const home = setup("/");
    expect(await screen.findByText("landing page")).toBeInTheDocument();
    expect(home.marketing.calls.mount).toHaveLength(0);
    cleanup();

    const blog = setup("/blog");
    expect(await screen.findByText("marketing page")).toBeInTheDocument();
    expect(blog.landing.calls.mount).toHaveLength(0);
  });

  it("serves the marketing remote by default", async () => {
    setup("/pricing");
    expect(await screen.findByText("marketing page")).toBeInTheDocument();
    expect(screen.getByTestId("header-login")).toBeInTheDocument();
  });

  it("labels the shell and the remote on screen, and the toggle hides the labels", async () => {
    setup("/pricing");
    await screen.findByText("marketing page");
    expect(screen.getByTestId("owner-tag-shell")).toHaveTextContent(
      "shell · React 19 host",
    );
    expect(screen.getByTestId("owner-tag-marketing")).toHaveTextContent(
      "marketing · React 19 remote",
    );

    await userEvent.click(screen.getByTestId("owners-toggle"));

    expect(screen.queryByTestId("owner-tag-shell")).not.toBeInTheDocument();
    expect(screen.queryByTestId("owner-tag-marketing")).not.toBeInTheDocument();
    expect(screen.getByText("marketing page")).toBeInTheDocument();
  });

  it("offers the primary navigation in the header and follows it", async () => {
    setup("/");
    await screen.findByText("landing page");

    await userEvent.click(screen.getByTestId("header-nav-pricing"));

    expect(await screen.findByText("marketing page")).toBeInTheDocument();
    expect(screen.getByTestId("header-nav-pricing")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("does not open the tour unless it was asked to", async () => {
    setup("/");
    await screen.findByText("landing page");
    expect(screen.queryByText("One shell, many apps")).not.toBeInTheDocument();
  });

  it("opens the tour on a first visit, and the header button replays it from the first step", async () => {
    setup("/", true);
    expect(await screen.findByText("One shell, many apps")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /skip tour/i }));
    expect(screen.queryByText("One shell, many apps")).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId("tour-start"));
    expect(await screen.findByText("One shell, many apps")).toBeInTheDocument();
  });

  it("sends signed-out visitors away from /dashboard to sign in", async () => {
    const { dashboard } = setup("/dashboard");
    expect(await screen.findByText("auth form")).toBeInTheDocument();
    expect(dashboard.calls.mount).toHaveLength(0);
  });

  it("lands a user on the dashboard after the auth remote signs them in, then guards again after logout", async () => {
    const { services } = setup("/auth/signin");
    expect(await screen.findByText("auth form")).toBeInTheDocument();

    act(() => services.session.signIn({ email: "demo@example.com" }));
    expect(
      await screen.findByText("dashboard for demo@example.com"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("header-logout")).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("header-logout"));
    expect(await screen.findByText("landing page")).toBeInTheDocument();
    expect(screen.getByTestId("header-login")).toBeInTheDocument();
  });

  it("keeps the shell usable when one remote fails to load", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const services = fakeServices();
    const ok = registryOf({});
    render(
      <MemoryRouter initialEntries={["/auth/signin"]}>
        <UiProvider mode="light">
          <Shell
            services={services}
            remotes={{
              ...ok,
              auth: () =>
                Promise.reject(new Error("net::ERR_CONNECTION_REFUSED")),
            }}
          />
        </UiProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The auth module is unavailable",
    );
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  it("does not let one remote's failure leak into another remote's route", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const ok = registryOf({
      landing: fakeRemote((el) => void (el.textContent = "landing page")).mount,
    });
    render(
      <MemoryRouter initialEntries={["/auth/signin"]}>
        <UiProvider mode="light">
          <Shell
            services={fakeServices()}
            remotes={{ ...ok, auth: () => Promise.reject(new Error("down")) }}
          />
        </UiProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The auth module is unavailable",
    );

    await userEvent.click(screen.getByTestId("header-brand"));
    expect(await screen.findByText("landing page")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
