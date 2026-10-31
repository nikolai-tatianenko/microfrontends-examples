import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test-utils";
import { Header } from "./Header";

describe("Header", () => {
  it("offers Login to signed-out users, linking to the auth remote", () => {
    renderWithProviders(<Header isSignedIn={false} onSignOut={jest.fn()} />);
    expect(screen.getByTestId("header-login")).toHaveAttribute(
      "href",
      "/auth/signin",
    );
    expect(screen.queryByTestId("header-logout")).not.toBeInTheDocument();
  });

  it("offers Logout to signed-in users and reports the click", async () => {
    const onSignOut = jest.fn();
    renderWithProviders(<Header isSignedIn onSignOut={onSignOut} />);
    await userEvent.click(screen.getByTestId("header-logout"));
    expect(onSignOut).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("header-login")).not.toBeInTheDocument();
  });

  it("offers the primary navigation, each item linking to its route", () => {
    renderWithProviders(<Header isSignedIn={false} onSignOut={jest.fn()} />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((a) => a.getAttribute("href")),
    ).toEqual(["/", "/blog", "/pricing", "/about"]);
  });

  it("marks the current page, and only that one", () => {
    renderWithProviders(
      <Header isSignedIn={false} onSignOut={jest.fn()} />,
      "/pricing",
    );
    expect(screen.getByTestId("header-nav-pricing")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByTestId("header-nav-home")).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByTestId("header-nav-blog")).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("does not mark Home as current on every page", () => {
    renderWithProviders(
      <Header isSignedIn={false} onSignOut={jest.fn()} />,
      "/",
    );
    expect(screen.getByTestId("header-nav-home")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("offers the Dashboard only to signed-in users", () => {
    const { unmount } = renderWithProviders(
      <Header isSignedIn={false} onSignOut={jest.fn()} />,
    );
    expect(
      screen.queryByTestId("header-nav-dashboard"),
    ).not.toBeInTheDocument();
    unmount();

    renderWithProviders(
      <Header isSignedIn onSignOut={jest.fn()} />,
      "/dashboard",
    );
    expect(screen.getByTestId("header-nav-dashboard")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders the actions the host supplies", () => {
    renderWithProviders(
      <Header
        isSignedIn={false}
        onSignOut={jest.fn()}
        actions={<button data-test-id="host-action">Tour</button>}
      />,
    );
    expect(screen.getByTestId("host-action")).toBeInTheDocument();
  });
});
