import type { Mount, Services } from "@blog/contract";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface RemoteHostProps {
  mount: Mount;
  services: Services;
}

/**
 * Bridges one remote into the shell's React tree.
 *
 * - mounts into a fresh child element (so StrictMode's mount/unmount/mount never reuses a root)
 * - mirrors the remote's navigation into the shell URL, and the shell URL into the remote
 * - always unmounts on cleanup, so navigating away leaves no roots or listeners behind
 */
export function RemoteHost({ mount, services }: RemoteHostProps) {
  const container = useRef<HTMLDivElement>(null);
  const handle = useRef<ReturnType<Mount> | null>(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Latest location and navigate fn without re-running the mount effect: in a non-data router
  // `navigate` gets a new identity on every location change, which would remount the remote.
  const current = useRef(pathname);
  current.current = pathname;
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  // Last path both sides agree on; stops us echoing a navigation back to where it came from.
  const synced = useRef(pathname);

  useEffect(() => {
    const el = document.createElement("div");
    container.current?.appendChild(el);

    synced.current = current.current;
    handle.current = mount(el, {
      initialPath: current.current,
      services,
      onNavigate: (path) => {
        if (path === synced.current) return;
        synced.current = path;
        navigateRef.current(path);
      },
    });

    return () => {
      handle.current?.unmount();
      handle.current = null;
      el.remove();
    };
  }, [mount, services]);

  useEffect(() => {
    if (pathname === synced.current) return;
    synced.current = pathname;
    handle.current?.onHostNavigate(pathname);
  }, [pathname]);

  return <div ref={container} data-test-id="remote-host" />;
}
