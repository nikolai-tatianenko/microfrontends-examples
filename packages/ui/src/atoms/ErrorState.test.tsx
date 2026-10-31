import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test-utils";
import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("announces the message as an alert", () => {
    renderWithProviders(<ErrorState message="Nope" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
    expect(screen.getByRole("alert")).toHaveTextContent("Nope");
  });

  it("only shows retry when a handler is given, and calls it", async () => {
    const onRetry = jest.fn();
    const { rerender } = renderWithProviders(<ErrorState />);
    expect(screen.queryByTestId("error-state-retry")).not.toBeInTheDocument();
    rerender(<ErrorState onRetry={onRetry} />);
    await userEvent.click(await screen.findByTestId("error-state-retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
