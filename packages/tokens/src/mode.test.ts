import {
  MODE_STORAGE_KEY,
  applyMode,
  createModeStore,
  readMode,
  subscribeMode,
} from "./mode";

function system(initial: boolean) {
  const listeners = new Set<() => void>();
  const media = {
    matches: initial,
    addEventListener: (_: "change", l: () => void) => void listeners.add(l),
    removeEventListener: (_: "change", l: () => void) =>
      void listeners.delete(l),
  };
  return {
    media,
    change(matches: boolean) {
      media.matches = matches;
      for (const l of listeners) l();
    },
  };
}

function memory(seed?: string) {
  const data = new Map<string, string>();
  if (seed) data.set(MODE_STORAGE_KEY, seed);
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

beforeEach(() => document.documentElement.removeAttribute("data-theme"));

describe("createModeStore", () => {
  it("follows the OS while the preference is system, and applies it at once", () => {
    const os = system(true);
    const store = createModeStore({
      root: document.documentElement,
      storage: memory(),
      system: os.media,
    });
    expect(store.getPreference()).toBe("system");
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");

    os.change(false);
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });

  it("stores an explicit choice and stops following the OS", () => {
    const os = system(false);
    const storage = memory();
    const store = createModeStore({
      root: document.documentElement,
      storage,
      system: os.media,
    });
    store.setPreference("dark");
    expect(storage.getItem(MODE_STORAGE_KEY)).toBe("dark");
    expect(store.getMode()).toBe("dark");

    os.change(true);
    os.change(false);
    expect(store.getMode()).toBe("dark");
  });

  it("stops following the OS once destroyed", () => {
    const os = system(false);
    const store = createModeStore({
      root: document.documentElement,
      storage: memory(),
      system: os.media,
    });
    store.destroy();
    os.change(true);
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });

  it("restores the saved choice and ignores a value it does not know", () => {
    const saved = createModeStore({
      root: document.documentElement,
      storage: memory("dark"),
      system: system(false).media,
    });
    expect(saved.getPreference()).toBe("dark");
    const junk = createModeStore({
      root: document.documentElement,
      storage: memory("purple"),
      system: system(false).media,
    });
    expect(junk.getPreference()).toBe("system");
  });

  it("notifies subscribers, and not after they unsubscribe", () => {
    const store = createModeStore({
      root: document.documentElement,
      storage: memory(),
      system: system(false).media,
    });
    const listener = jest.fn();
    const off = store.subscribe(listener);
    store.setPreference("dark");
    off();
    store.setPreference("light");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("works with no storage and no OS signal", () => {
    const store = createModeStore({
      root: document.documentElement,
      storage: null,
      system: null,
    });
    expect(store.getMode()).toBe("light");
    store.setPreference("dark");
    expect(store.getMode()).toBe("dark");
  });

  it("survives storage that throws", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    const store = createModeStore({
      root: document.documentElement,
      storage: broken,
      system: system(false).media,
    });
    expect(() => store.setPreference("dark")).not.toThrow();
    expect(store.getMode()).toBe("dark");
  });
});

describe("readMode and subscribeMode", () => {
  it("read what the host put on the page", () => {
    applyMode("dark");
    expect(readMode()).toBe("dark");
  });

  it("fall back to light when no host set a mode and the OS gives no signal", () => {
    expect(readMode()).toBe("light");
  });

  it("report a change of the attribute", async () => {
    const changed = new Promise<void>((resolve) => {
      const off = subscribeMode(() => {
        off();
        resolve();
      });
    });
    applyMode("dark");
    await changed;
    expect(readMode()).toBe("dark");
  });
});
