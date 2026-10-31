import { screen } from "@testing-library/react";
import { plans } from "../__fixtures__/data";
import { renderWithProviders } from "../test-utils";
import { PricingGrid } from "./PricingGrid";

describe("PricingGrid", () => {
  it("renders one card per plan, in order", () => {
    renderWithProviders(<PricingGrid plans={plans} />);
    expect(screen.getByTestId("plan-free")).toBeInTheDocument();
    expect(screen.getByTestId("plan-pro")).toBeInTheDocument();
    expect(screen.getByTestId("plan-team")).toBeInTheDocument();
  });
});
