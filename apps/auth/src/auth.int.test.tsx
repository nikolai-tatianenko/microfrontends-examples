import { ApolloProvider } from "@apollo/client";
import { schema } from "@blog/api/schema";
import { createSchemaClient } from "@blog/apollo/testing";
import { createSessionStore } from "@blog/contract";
import { renderWithProviders } from "@blog/ui/testing";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";

/** The auth remote end to end: real form, real mutation documents, real resolvers and password hashing. */
function setup(route = "/auth/signin") {
  const session = createSessionStore();
  const apollo = createSchemaClient(schema);
  renderWithProviders(
    <ApolloProvider client={apollo}>
      <App services={{ session, apollo }} />
    </ApolloProvider>,
    route,
  );
  return { session };
}

const submit = async (email: string, password: string) => {
  await userEvent.type(screen.getByTestId("email"), email);
  await userEvent.type(screen.getByTestId("password"), password);
  await userEvent.click(screen.getByTestId("submit"));
};

describe("auth remote (real API schema)", () => {
  it("signs the demo user into the host session", async () => {
    const { session } = setup();
    await submit("demo@example.com", "password123");
    await waitFor(() =>
      expect(session.getUser()).toEqual({ email: "demo@example.com" }),
    );
  });

  it("shows the API's message for bad credentials and leaves the session empty", async () => {
    const { session } = setup();
    await submit("demo@example.com", "wrong-password");
    expect(await screen.findByTestId("form-error")).toHaveTextContent(
      "Invalid email or password.",
    );
    expect(session.getUser()).toBeNull();
  });

  it("registers a new account and signs it in", async () => {
    const { session } = setup("/auth/signup");
    await submit(`int-${Date.now()}@example.com`, "a-strong-password");
    await waitFor(() => expect(session.getUser()).not.toBeNull());
  });

  it("sends unknown /auth paths to the sign-in form", () => {
    setup("/auth/whatever");
    expect(screen.getByTestId("signin-form")).toBeInTheDocument();
  });
});
