import { createApolloClient } from "@blog/apollo";
import { getModeStore } from "@blog/tokens/mode";
import "@blog/tokens/tokens.css";
import { requireElement } from "./dom";
import { STANDALONE_ROOT_ID, type Mount } from "./mount";
import { createSessionStore } from "./session";

/**
 * Runs a remote on its own (`pnpm --filter @blog/<name> dev`) with local services and no host.
 * Every remote's standalone entry is this one call. With no host, the page is its own: it loads the design
 * tokens and owns the color mode, which the shell does when remotes are composed.
 */
export function runStandalone(
  mount: Mount,
  initialPath = window.location.pathname,
) {
  getModeStore();
  return mount(requireElement(STANDALONE_ROOT_ID), {
    initialPath,
    services: { session: createSessionStore(), apollo: createApolloClient() },
  });
}
