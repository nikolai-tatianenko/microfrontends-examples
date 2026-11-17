import { createApolloClient } from "@blog/apollo";
import { requireElement } from "./dom";
import { STANDALONE_ROOT_ID, type Mount } from "./mount";
import { createSessionStore } from "./session";

/**
 * Runs a remote on its own (`pnpm --filter @blog/<name> dev`) with local services and no host.
 * Every remote's standalone entry is this one call.
 */
export function runStandalone(
  mount: Mount,
  initialPath = window.location.pathname,
) {
  return mount(requireElement(STANDALONE_ROOT_ID), {
    initialPath,
    services: { session: createSessionStore(), apollo: createApolloClient() },
  });
}
