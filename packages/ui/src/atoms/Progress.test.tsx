import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test-utils";
import { Progress } from "./Progress";

describe("Progress", () => {
  it("is announced to assistive technology with a translated label", () => {
    renderWithProviders(<Progress />);
    expect(
      screen.getByRole("progressbar", { name: "Loading" }),
    ).toBeInTheDocument();
  });
});
