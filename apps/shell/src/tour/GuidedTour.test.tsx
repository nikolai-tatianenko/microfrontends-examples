import { UiProvider } from "@blog/ui";
import { render, screen } from "@testing-library/react";
import { useEffect, useState } from "react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { GuidedTour } from "./GuidedTour";

function Where() {
  return <span data-test-id="where">{useLocation().pathname}</span>;
}

/** A page that has every element the tour points at, standing in for the shell and the remotes. */
function setup(onEnd = jest.fn()) {
  render(
    <MemoryRouter>
      <UiProvider mode="light">
        <div data-test-id="header-nav">menu</div>
        <div data-test-id="owners-toggle">switch</div>
        <div data-test-id="landing-stack">stack</div>
        <div data-test-id="blog-post-item">post</div>
        <div data-test-id="signin-form">form</div>
        <Where />
        <GuidedTour onEnd={onEnd} />
      </UiProvider>
    </MemoryRouter>,
  );
  return { onEnd, user: userEvent.setup() };
}

describe("GuidedTour", () => {
  it("opens on the first step", async () => {
    setup();
    expect(await screen.findByText("One shell, many apps")).toBeInTheDocument();
  });

  it("walks the steps, following each step to its route", async () => {
    const { user } = setup();
    await screen.findByText("One shell, many apps");

    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(await screen.findByText("See who renders what")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(await screen.findByText("A Vite-built remote")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(
      await screen.findByText("Data through one GraphQL client"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("where")).toHaveTextContent("/blog");
  });

  it("reports the end once when the visitor skips it", async () => {
    const { user, onEnd } = setup();
    await screen.findByText("One shell, many apps");

    await user.click(screen.getByRole("button", { name: /skip tour/i }));

    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it("finishes on the last step with a Finish button", async () => {
    const { user, onEnd } = setup();
    await screen.findByText("One shell, many apps");
    for (let i = 0; i < 4; i += 1) {
      await user.click(screen.getByRole("button", { name: /next/i }));
      // The progress label changes with the step, which is how we know the next one is showing.
      await screen.findByRole("button", {
        name: i < 3 ? `Next (${i + 2} of 5)` : /finish/i,
      });
    }
    expect(
      await screen.findByText("Now try the demo account"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /finish/i }));

    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("where")).toHaveTextContent("/auth/signin");
  });

  it("waits for a remote that renders its target after the route changes", async () => {
    // Like the real marketing remote: nothing on the page until the route is /blog and the remote has loaded.
    function SlowRemote() {
      const { pathname } = useLocation();
      const [ready, setReady] = useState(false);
      useEffect(() => {
        if (pathname !== "/blog") return;
        const id = setTimeout(() => setReady(true), 600);
        return () => clearTimeout(id);
      }, [pathname]);
      return ready ? <div data-test-id="blog-post-item">post</div> : null;
    }
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <UiProvider mode="light">
          <div data-test-id="header-nav">menu</div>
          <div data-test-id="owners-toggle">switch</div>
          <div data-test-id="landing-stack">stack</div>
          <SlowRemote />
          <GuidedTour onEnd={jest.fn()} />
        </UiProvider>
      </MemoryRouter>,
    );
    await screen.findByText("One shell, many apps");
    for (let i = 0; i < 2; i += 1) {
      await user.click(screen.getByRole("button", { name: /next/i }));
      await screen.findByRole("button", { name: `Next (${i + 2} of 5)` });
    }

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(
      await screen.findByText(
        "Data through one GraphQL client",
        {},
        { timeout: 4000 },
      ),
    ).toBeInTheDocument();
  });
});
