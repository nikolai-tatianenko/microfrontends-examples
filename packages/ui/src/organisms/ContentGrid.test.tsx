import { screen } from "@testing-library/react";
import { posts } from "../__fixtures__/data";
import { renderWithProviders } from "../test-utils";
import { ContentGrid } from "./ContentGrid";

describe("ContentGrid", () => {
  it("renders one article per post", () => {
    renderWithProviders(<ContentGrid posts={posts} />);
    expect(screen.getAllByTestId("blog-post-item")).toHaveLength(posts.length);
    expect(
      screen.getByRole("heading", { name: "Shipping a shell" }),
    ).toBeInTheDocument();
  });
});
