import { formatDelta, formatWhen } from "./format";

describe("formatDelta", () => {
  it.each([
    [4.2, "+4.2%"],
    [-2.34, "−2.3%"],
    [0, "0.0%"],
  ])("formats %p as %p", (input, expected) =>
    expect(formatDelta(input)).toBe(expected),
  );
});

describe("formatWhen", () => {
  it("is timezone-independent", () => {
    expect(formatWhen("2026-10-28T09:12:00Z")).toBe("Oct 28, 2026, 9:12 AM");
  });
});
