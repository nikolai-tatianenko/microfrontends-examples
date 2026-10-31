import { createApolloClient } from ".";

describe("createApolloClient", () => {
  it("returns an independent client per call (no module-level singleton)", () => {
    expect(createApolloClient()).not.toBe(createApolloClient());
  });

  it("starts with an empty cache", () => {
    expect(createApolloClient().cache.extract()).toEqual({});
  });
});
