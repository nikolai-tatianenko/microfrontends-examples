import { hasSeenTour, markTourSeen } from "./tourState";

describe("tour state", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => jest.restoreAllMocks());

  it("has not been seen by a new visitor, and remembers once marked", () => {
    expect(hasSeenTour()).toBe(false);
    markTourSeen();
    expect(hasSeenTour()).toBe(true);
  });

  it("answers 'seen' when storage is blocked, so the tour does not greet every page load", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(hasSeenTour()).toBe(true);
  });

  it("does not throw when storage refuses the write", () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(() => markTourSeen()).not.toThrow();
  });
});
