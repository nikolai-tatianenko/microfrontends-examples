import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test-utils";
import { SkipLink } from "./SkipLink";

describe("SkipLink", () => {
  it("is a translated link to the content", () => {
    renderWithProviders(<SkipLink targetId="content" />);
    expect(
      screen.getByRole("link", { name: "Skip to main content" }),
    ).toHaveAttribute("href", "#content");
  });

  it("moves focus to the content instead of changing the URL", async () => {
    renderWithProviders(
      <>
        <SkipLink targetId="content" />
        <div id="content" tabIndex={-1} />
      </>,
    );
    await userEvent.click(
      screen.getByRole("link", { name: "Skip to main content" }),
    );
    expect(document.getElementById("content")).toHaveFocus();
    expect(window.location.hash).toBe("");
  });

  it("does nothing when the target is missing", async () => {
    renderWithProviders(<SkipLink targetId="nowhere" />);
    await expect(
      userEvent.click(screen.getByTestId("skip-link")),
    ).resolves.toBeUndefined();
  });
});
