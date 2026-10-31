import { screen } from "@testing-library/react";
import { plans } from "../__fixtures__/data";
import { renderWithProviders } from "../test-utils";
import { PlanCard } from "./PlanCard";

describe("PlanCard", () => {
  it("renders price, features and a CTA linking to ctaTo", () => {
    const { id: _id, ...pro } = plans[1]!;
    renderWithProviders(<PlanCard {...pro} />);
    expect(screen.getByText("$15")).toBeInTheDocument();
    expect(screen.getByText("20 projects")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start trial" })).toHaveAttribute(
      "href",
      "/auth/signup",
    );
  });
});
