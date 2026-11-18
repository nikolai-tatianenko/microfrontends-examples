import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test-utils";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  it("is one named group with a button per choice, the current one pressed", () => {
    renderWithProviders(<ThemeToggle value="dark" onChange={() => {}} />);
    expect(screen.getByRole("group", { name: "Color theme" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Dark" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Light" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "Match system" })).toBeVisible();
  });

  it("reports the chosen preference", async () => {
    const onChange = jest.fn();
    renderWithProviders(<ThemeToggle value="light" onChange={onChange} />);
    await userEvent.click(screen.getByTestId("theme-system"));
    expect(onChange).toHaveBeenCalledWith("system");
  });

  it("keeps the choice when the pressed button is pressed again", async () => {
    const onChange = jest.fn();
    renderWithProviders(<ThemeToggle value="light" onChange={onChange} />);
    await userEvent.click(screen.getByTestId("theme-light"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
