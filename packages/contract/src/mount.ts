import type { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import type { SessionStore } from "./session";

/** Capabilities the host injects into every remote. */
export interface Services {
  session: SessionStore;
  /** One client for the whole page, so remotes share a normalized cache. */
  apollo: ApolloClient<NormalizedCacheObject>;
}

export interface MountOptions {
  /** Path the remote should render first (the host's current location). */
  initialPath: string;
  services: Services;
  /** Called when the remote navigates internally; the host mirrors it in the URL. */
  onNavigate?: (path: string) => void;
}

export interface MountHandle {
  /** The host URL changed (back/forward, header link); follow it. */
  onHostNavigate(path: string): void;
  /** Tear down the remote's tree and listeners. Must be idempotent. */
  unmount(): void;
}

/**
 * The only thing a remote exposes via Module Federation (`./mount`).
 * Framework-agnostic: React and Vue remotes implement the same function.
 */
export type Mount = (el: HTMLElement, options: MountOptions) => MountHandle;

/** Stable hook for remotes to run standalone in dev (no host). */
export const STANDALONE_ROOT_ID = "root";
