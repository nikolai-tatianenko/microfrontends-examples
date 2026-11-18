import { CONTRAST_PAIRS, contrastRatio, tokenValue } from "./index";

describe("contrastRatio", () => {
  it("is 21 for black on white and 1 for a color on itself", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#777777")).toBeCloseTo(1, 5);
  });

  it("does not depend on which color comes first", () => {
    expect(contrastRatio("#0d47a1", "#ffffff")).toBe(
      contrastRatio("#ffffff", "#0d47a1"),
    );
  });
});

// The gate: a token edit that drops any pair below its minimum fails here, in milliseconds, before any build or browser.
describe("design tokens meet WCAG 2.2 AAA contrast", () => {
  const cases = CONTRAST_PAIRS.flatMap((pair) =>
    pair.modes.map((mode) => ({ ...pair, mode })),
  );

  it.each(cases)(
    "$foreground on $background · $mode is at least $minimum:1",
    ({ foreground, background, minimum, mode }) => {
      const ratio = contrastRatio(
        tokenValue(mode, foreground),
        tokenValue(mode, background),
      );
      expect(ratio).toBeGreaterThanOrEqual(minimum);
    },
  );
});
