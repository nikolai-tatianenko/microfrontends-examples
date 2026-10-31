import { UiProvider } from "@blog/ui";
import { render, screen } from "@testing-library/react";
import { OwnerFrame } from "./OwnerFrame";

const renderFrame = (visible: boolean) =>
  render(
    <UiProvider mode="light">
      <OwnerFrame owner="dashboard" visible={visible}>
        <p>content</p>
      </OwnerFrame>
    </UiProvider>,
  );

describe("OwnerFrame", () => {
  it("names the owning app and its technology", () => {
    renderFrame(true);
    expect(screen.getByTestId("owner-tag-dashboard")).toHaveTextContent(
      "dashboard · Vue 3 remote",
    );
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("renders the children untouched when hidden", () => {
    renderFrame(false);
    expect(screen.queryByTestId("owner-dashboard")).not.toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
