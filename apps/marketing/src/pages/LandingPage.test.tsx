import { posts } from "@blog/ui/fixtures";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders as renderPage } from "@blog/ui/testing";
import { LandingPageView } from "./LandingPage";

describe("LandingPageView", () => {
  it("shows a loading bar while loading", () => {
    renderPage(<LandingPageView loading onRetry={jest.fn()} />);
    expect(screen.getByTestId("progress")).toBeInTheDocument();
    expect(screen.queryByTestId("content-grid")).not.toBeInTheDocument();
  });

  it("shows the posts once loaded", () => {
    renderPage(
      <LandingPageView loading={false} posts={posts} onRetry={jest.fn()} />,
    );
    expect(screen.getAllByTestId("blog-post-item")).toHaveLength(posts.length);
  });

  it("shows the error and retries on request", async () => {
    const onRetry = jest.fn();
    renderPage(
      <LandingPageView
        loading={false}
        error="Network error"
        onRetry={onRetry}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Network error");
    await userEvent.click(screen.getByTestId("error-state-retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("links the call to action to pricing", () => {
    renderPage(
      <LandingPageView loading={false} posts={[]} onRetry={jest.fn()} />,
    );
    expect(screen.getByTestId("cta-pricing")).toHaveAttribute(
      "href",
      "/pricing",
    );
  });
});
