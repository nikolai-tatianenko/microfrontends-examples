import { plans } from "@blog/ui/fixtures";
import { renderWithProviders } from "@blog/ui/testing";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PricingPageView } from "./PricingPage";

describe("PricingPageView", () => {
  it("shows a loading bar while loading", () => {
    renderWithProviders(<PricingPageView loading onRetry={jest.fn()} />);
    expect(screen.getByTestId("progress")).toBeInTheDocument();
    expect(screen.queryByTestId("pricing-grid")).not.toBeInTheDocument();
  });

  it("shows the plans once loaded", () => {
    renderWithProviders(
      <PricingPageView loading={false} plans={plans} onRetry={jest.fn()} />,
    );
    expect(screen.getByTestId("pricing-grid")).toBeInTheDocument();
  });

  it("shows the error and retries on request", async () => {
    const onRetry = jest.fn();
    renderWithProviders(
      <PricingPageView
        loading={false}
        error="Network error"
        onRetry={onRetry}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Network error");
    await userEvent.click(screen.getByTestId("error-state-retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
