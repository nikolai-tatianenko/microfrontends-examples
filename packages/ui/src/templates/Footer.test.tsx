import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test-utils";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("links to the marketing pages", () => {
    renderWithProviders(<Footer />);
    const nav = screen.getByRole("navigation", { name: "Footer" });
    expect(nav).toHaveTextContent("Home");
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute(
      "href",
      "/pricing",
    );
  });
});
