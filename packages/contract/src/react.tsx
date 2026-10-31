import { ApolloProvider } from "@apollo/client";
import { useEffect, useRef, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import type { Mount, MountOptions, Services } from "./mount";

interface BridgeProps {
  onNavigate?: (path: string) => void;
  register: (follow: (path: string) => void) => void;
}

/** Keeps the remote's in-memory router and the host URL in sync, in both directions. */
function NavigationBridge({ onNavigate, register }: BridgeProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const current = useRef(pathname);

  useEffect(() => {
    register((path) => {
      if (path !== current.current) navigate(path);
    });
  }, [navigate, register]);

  useEffect(() => {
    current.current = pathname;
    onNavigate?.(pathname);
  }, [pathname, onNavigate]);

  return null;
}

/**
 * Turns a React component into a federated `mount()`. Every React remote
 * calls this instead of hand-rolling roots, routers and teardown.
 */
export function createReactRemote(
  App: ComponentType<{ services: Services }>,
): Mount {
  return (el, { initialPath, services, onNavigate }: MountOptions) => {
    const root = createRoot(el);
    let follow: (path: string) => void = () => {};
    let mounted = true;

    root.render(
      <ApolloProvider client={services.apollo}>
        <MemoryRouter initialEntries={[initialPath]}>
          <NavigationBridge
            onNavigate={onNavigate}
            register={(fn) => (follow = fn)}
          />
          <App services={services} />
        </MemoryRouter>
      </ApolloProvider>,
    );

    return {
      onHostNavigate: (path) => follow(path),
      unmount() {
        if (!mounted) return;
        mounted = false;
        // Hosts call this from an effect cleanup, i.e. while React is committing, and React refuses
        // (and logs an error in dev) to unmount a root during a render. Defer it by one microtask.
        queueMicrotask(() => root.unmount());
      },
    };
  };
}
