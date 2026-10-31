import type { Mount } from "@blog/contract";
import { loadRemote } from "@module-federation/enhanced/runtime";

export type RemoteName = "marketing" | "auth" | "dashboard" | "landing";
export type RemoteLoader = () => Promise<{ mount: Mount }>;
export type RemoteRegistry = Record<RemoteName, RemoteLoader>;

/**
 * Loads `<name>/mount` through the Module Federation runtime rather than a static
 * `import("<name>/mount")`. Webpack's built-in remote handling caches a failed load
 * forever (it swaps the module factory for one that rethrows), so "Try again" could
 * never recover. The runtime API keeps its own entry cache and can retry.
 */
const federated =
  (name: RemoteName): RemoteLoader =>
  async () => {
    const module = await loadRemote<{ mount: Mount }>(`${name}/mount`);
    if (!module) throw new Error(`Remote "${name}" did not load.`);
    return module;
  };

/**
 * Production wiring. Kept in its own file so Jest never has to resolve a federated module.
 */
export const federatedRemotes: RemoteRegistry = {
  marketing: federated("marketing"),
  auth: federated("auth"),
  dashboard: federated("dashboard"),
  landing: federated("landing"),
};
