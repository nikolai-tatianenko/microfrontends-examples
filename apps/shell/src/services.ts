import { createApolloClient } from "@blog/apollo";
import { createSessionStore, type Services } from "@blog/contract";

/** The one place real implementations are chosen. Tests and Storybook build their own `Services`. */
export function createServices(): Services {
  return {
    session: createSessionStore(window.sessionStorage),
    apollo: createApolloClient(),
  };
}
