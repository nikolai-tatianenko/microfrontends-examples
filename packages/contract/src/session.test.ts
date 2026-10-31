import { createSessionStore } from "./session";

const memoryStorage = () => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
};

describe("createSessionStore", () => {
  it("starts signed out", () => {
    expect(createSessionStore().getUser()).toBeNull();
  });

  it("notifies subscribers on sign-in and sign-out, and stops after unsubscribe", () => {
    const store = createSessionStore();
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);

    store.signIn({ email: "a@b.co" });
    store.signOut();
    unsubscribe();
    store.signIn({ email: "c@d.co" });

    expect(listener.mock.calls).toEqual([[{ email: "a@b.co" }], [null]]);
  });

  it("keeps the same user reference between changes (safe for useSyncExternalStore)", () => {
    const store = createSessionStore();
    store.signIn({ email: "a@b.co" });
    expect(store.getUser()).toBe(store.getUser());
  });

  it("restores a persisted session", () => {
    const storage = memoryStorage();
    createSessionStore(storage).signIn({ email: "a@b.co" });
    expect(createSessionStore(storage).getUser()).toEqual({ email: "a@b.co" });
  });

  it("starts signed out when persisted data is corrupt or storage throws", () => {
    const corrupt = memoryStorage();
    corrupt.setItem("blog.session", "{nope");
    expect(createSessionStore(corrupt).getUser()).toBeNull();

    const throwing = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    const store = createSessionStore(throwing);
    store.signIn({ email: "a@b.co" });
    expect(store.getUser()).toEqual({ email: "a@b.co" });
  });
});
