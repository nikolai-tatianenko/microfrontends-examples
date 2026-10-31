/** The signed-in user, as far as remotes are concerned. */
export interface User {
  email: string;
}

/** Listener notified with the new user (or `null` after sign-out). */
export type SessionListener = (user: User | null) => void;

/**
 * Host-owned session. Remotes receive this through `mount()` and never
 * import it from each other, so auth can be swapped without touching them.
 */
export interface SessionStore {
  /** Current user; the same object reference until the session changes. */
  getUser(): User | null;
  signIn(user: User): void;
  signOut(): void;
  /** Returns an unsubscribe function. Compatible with `useSyncExternalStore`. */
  subscribe(listener: SessionListener): () => void;
}

type PersistentStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const STORAGE_KEY = "blog.session";

function read(storage?: PersistentStorage): User | null {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof (parsed as User).email === "string") {
      return { email: (parsed as User).email };
    }
  } catch {
    // Corrupt or blocked storage: start signed out.
  }
  return null;
}

function write(
  storage: PersistentStorage | undefined,
  user: User | null,
): void {
  try {
    if (user) storage?.setItem(STORAGE_KEY, JSON.stringify(user));
    else storage?.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be unavailable (private mode); the in-memory session still works.
  }
}

/**
 * Creates a session store. Pass `sessionStorage` to survive page reloads;
 * omit it for a purely in-memory session (tests, Storybook, standalone remotes).
 */
export function createSessionStore(storage?: PersistentStorage): SessionStore {
  let user = read(storage);
  const listeners = new Set<SessionListener>();

  const set = (next: User | null) => {
    user = next;
    write(storage, next);
    listeners.forEach((listener) => listener(next));
  };

  return {
    getUser: () => user,
    signIn: (next) => set({ email: next.email }),
    signOut: () => set(null),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
