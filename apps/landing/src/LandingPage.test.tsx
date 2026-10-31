import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { FinalCta, Hero, LandingPage, Pillars, StackGrid } from "./LandingPage";
import { copy } from "./copy";

const Where = () => <p data-test-id="where">{useLocation().pathname}</p>;

const setup = () =>
  render(
    <MemoryRouter>
      <LandingPage />
      <Where />
    </MemoryRouter>,
  );

describe("LandingPage", () => {
  it("has one h1 and a heading per section", () => {
    setup();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);
  });

  it("lists every app with its stack and marks the current one", () => {
    setup();
    const stack = within(screen.getByTestId("landing-stack"));
    expect(stack.getAllByRole("listitem")).toHaveLength(copy.stack.length);
    expect(
      within(screen.getByTestId("landing-app-dashboard")).getByText(
        "Vue 3 · scoped CSS · Rspack",
      ),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("landing-app-landing")).getByText(
        copy.currentLabel,
      ),
    ).toBeInTheDocument();
  });

  it.each([
    ["landing-cta-start", "/auth/signup"],
    ["landing-cta-blog", "/blog"],
    ["landing-cta-pricing", "/pricing"],
    ["landing-cta-signin", "/auth/signin"],
  ])("%s navigates to %s", async (testId, path) => {
    setup();
    expect(screen.getByTestId(testId)).toHaveAttribute("href", path);
    await userEvent.click(screen.getByTestId(testId));
    expect(screen.getByTestId("where")).toHaveTextContent(path);
  });
});

describe("sections (each is also a Storybook story)", () => {
  const renderSection = (section: React.ReactNode) =>
    render(<MemoryRouter>{section}</MemoryRouter>);

  it("Hero offers the three entry points", () => {
    renderSection(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      copy.title,
    );
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });

  it("Pillars shows one card per idea", () => {
    renderSection(<Pillars />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(
      copy.pillars.length,
    );
  });

  it("StackGrid shows every app", () => {
    renderSection(<StackGrid />);
    expect(screen.getAllByRole("listitem")).toHaveLength(copy.stack.length);
  });

  it("FinalCta links to sign-in", () => {
    renderSection(<FinalCta />);
    expect(screen.getByTestId("landing-cta-signin")).toHaveAttribute(
      "href",
      "/auth/signin",
    );
  });
});
