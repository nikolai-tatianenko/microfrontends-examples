import { ApolloProvider } from "@apollo/client";
import { schema } from "@blog/api/schema";
import { createSchemaClient } from "@blog/apollo/testing";
import { screen } from "@testing-library/react";
import { renderWithProviders as renderPage } from "@blog/ui/testing";
import { LandingPage } from "./LandingPage";
import { PricingPage } from "./PricingPage";

/** Containers + the real API schema: the documents this remote ships must be valid against it. */
const withApi = (ui: React.ReactElement) => (
  <ApolloProvider client={createSchemaClient(schema)}>{ui}</ApolloProvider>
);

describe("marketing pages (real API schema)", () => {
  it("landing page renders the six posts the API serves", async () => {
    renderPage(withApi(<LandingPage />));
    expect(await screen.findAllByTestId("blog-post-item")).toHaveLength(6);
    expect(
      screen.getByRole("heading", { name: "Shipping a shell" }),
    ).toBeInTheDocument();
  });

  it("pricing page renders every plan, with a call to action per plan", async () => {
    renderPage(withApi(<PricingPage />));
    expect(await screen.findByTestId("plan-pro")).toHaveTextContent("$15");
    expect(screen.getByTestId("plan-free")).toHaveTextContent("Get started");
    expect(screen.getByTestId("plan-team")).toHaveTextContent("Start trial");
  });
});
