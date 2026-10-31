import { createYoga } from "graphql-yoga";
import { schema } from "./schema";

const production = process.env.NODE_ENV === "production";

/** The GraphQL HTTP handler. Exposed separately from the listener so tests can call `yoga.fetch`. */
export function createApp() {
  return createYoga({
    schema,
    graphqlEndpoint: "/graphql",
    landingPage: false,
    // Production: unexpected errors become a generic message (deliberate GraphQLErrors, like
    // "Invalid email or password.", still reach the client). Development and tests see the real cause.
    maskedErrors: production,
    graphiql: !production,
  });
}
