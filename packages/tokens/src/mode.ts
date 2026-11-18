/**
 * The color mode is one attribute on <html>: `data-theme="light" | "dark"`. The shell owns it (it is the only
 * place a visitor can change it); every remote, whatever its framework, only reads it, and the generated CSS
 * custom properties follow it. No remote passes theme state through props or keeps its own copy.
 */
export type Mode = "light" | "dark";
export type ModePreference = Mode | "system";

export const MODE_STORAGE_KEY = "blog.mode";
const ATTRIBUTE = "data-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

const isPreference = (value: unknown): value is ModePreference =>
  value === "light" || value === "dark" || value === "system";

function systemMode(): Mode {
  return typeof matchMedia === "function" && matchMedia(DARK_QUERY).matches
    ? "dark"
    : "light";
}

/** The mode the page is showing: the host's attribute, or the OS setting when no host set one (standalone, Storybook). */
export function readMode(root: HTMLElement = document.documentElement): Mode {
  const set = root.getAttribute(ATTRIBUTE);
  return set === "light" || set === "dark" ? set : systemMode();
}

/** Puts a mode on the page. The shell calls this; remotes never should. */
export function applyMode(
  mode: Mode,
  root: HTMLElement = document.documentElement,
) {
  root.setAttribute(ATTRIBUTE, mode);
}

/** Calls `listener` when the page's mode changes: the attribute (a host switch) or the OS setting (no host). */
export function subscribeMode(
  listener: () => void,
  root: HTMLElement = document.documentElement,
) {
  const observer = new MutationObserver(listener);
  observer.observe(root, { attributes: true, attributeFilter: [ATTRIBUTE] });
  const media =
    typeof matchMedia === "function" ? matchMedia(DARK_QUERY) : undefined;
  media?.addEventListener("change", listener);
  return () => {
    observer.disconnect();
    media?.removeEventListener("change", listener);
  };
}

export interface ModeStore {
  /** Stops following the OS. Only tests and Storybook need it; the page's one store lives as long as the page. */
  destroy(): void;
  getPreference(): ModePreference;
  /** What the preference resolves to right now. */
  getMode(): Mode;
  setPreference(preference: ModePreference): void;
  subscribe(listener: () => void): () => void;
}

interface Environment {
  root: HTMLElement;
  storage: Pick<Storage, "getItem" | "setItem"> | null;
  /** Reports the OS preference; `null` when the environment has none. */
  system: {
    matches: boolean;
    addEventListener(type: "change", listener: () => void): void;
    removeEventListener(type: "change", listener: () => void): void;
  } | null;
}

function browserEnvironment(): Environment {
  let storage: Environment["storage"] = null;
  try {
    storage = localStorage;
  } catch {
    // Blocked storage (private window, disabled cookies): the choice just does not persist.
  }
  return {
    root: document.documentElement,
    storage,
    system: typeof matchMedia === "function" ? matchMedia(DARK_QUERY) : null,
  };
}

/**
 * The host's store: remembers the visitor's choice, follows the OS while it is "system", and keeps the
 * attribute on <html> in step. It applies the mode as soon as it is created, so create it before the first render.
 */
export function createModeStore(
  env: Environment = browserEnvironment(),
): ModeStore {
  const listeners = new Set<() => void>();
  let preference: ModePreference = "system";
  try {
    const saved = env.storage?.getItem(MODE_STORAGE_KEY);
    if (isPreference(saved)) preference = saved;
  } catch {
    // Unreadable storage behaves like an empty one.
  }

  const resolve = (): Mode =>
    preference === "system"
      ? env.system?.matches
        ? "dark"
        : "light"
      : preference;
  const sync = () => {
    applyMode(resolve(), env.root);
    for (const listener of listeners) listener();
  };
  const onSystemChange = () => {
    if (preference === "system") sync();
  };
  env.system?.addEventListener("change", onSystemChange);
  applyMode(resolve(), env.root);

  return {
    destroy: () => env.system?.removeEventListener("change", onSystemChange),
    getPreference: () => preference,
    getMode: resolve,
    setPreference(next) {
      preference = next;
      try {
        env.storage?.setItem(MODE_STORAGE_KEY, next);
      } catch {
        // See above: the choice holds for this visit only.
      }
      sync();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

let shared: ModeStore | undefined;
/** The one store of this page. Only the shell (or a standalone remote, which is its own host) should call it. */
export function getModeStore(): ModeStore {
  return (shared ??= createModeStore());
}
