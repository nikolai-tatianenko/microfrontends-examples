import {
  createSessionStore,
  type Mount,
  type MountHandle,
  type MountOptions,
  type Services,
} from "@blog/contract";
import type { RemoteRegistry } from "./remotes/registry";

/** Services for tests: in-memory session, and an Apollo stand-in nobody should reach. */
export function fakeServices(): Services {
  return { session: createSessionStore(), apollo: {} as Services["apollo"] };
}

/** A framework-free fake remote that records how the host drove it. */
export function fakeRemote(
  render: (el: HTMLElement, options: MountOptions) => void = () => {},
) {
  const calls = {
    mount: [] as MountOptions[],
    navigate: [] as string[],
    unmount: 0,
  };
  const mount: Mount = (el, options) => {
    calls.mount.push(options);
    render(el, options);
    const handle: MountHandle = {
      onHostNavigate: (path) => void calls.navigate.push(path),
      unmount: () => void (calls.unmount += 1),
    };
    return handle;
  };
  return { mount, calls };
}

/** A full registry of fake remotes; pass real mounts only for the ones a test cares about. */
export function registryOf(
  mounts: Partial<Record<keyof RemoteRegistry, Mount>>,
): RemoteRegistry {
  const fallback = fakeRemote().mount;
  const names = [
    "marketing",
    "auth",
    "dashboard",
    "landing",
  ] as const satisfies ReadonlyArray<keyof RemoteRegistry>;
  return Object.fromEntries(
    names.map((name) => [
      name,
      () => Promise.resolve({ mount: mounts[name] ?? fallback }),
    ]),
  ) as RemoteRegistry;
}
