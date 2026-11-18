import { CONTRAST_PAIRS } from "@blog/tokens";
import { render, screen, within } from "@testing-library/react";
import {
  ColorTable,
  ContrastMatrix,
  ScaleTable,
  TypeSpecimen,
  level,
} from "./Foundations";

describe("Foundations pages", () => {
  it("lists a color token with both of its modes", () => {
    render(<ColorTable />);
    const row = screen.getByRole("row", { name: /color\.surface\.default/ });
    expect(within(row).getByText("#ffffff")).toBeVisible();
    expect(within(row).getByText("#121212")).toBeVisible();
    expect(within(row).getByText("--bd-color-surface-default")).toBeVisible();
  });

  it("measures every contrast pair in both modes and none of them fails", () => {
    render(<ContrastMatrix />);
    expect(screen.getAllByRole("row")).toHaveLength(CONTRAST_PAIRS.length + 1);
    expect(screen.queryByText(/Fail/)).toBeNull();
  });

  it("names the level a ratio reaches", () => {
    expect(level(8)).toBe("AAA");
    expect(level(5)).toBe("AA");
    expect(level(3.2)).toBe("AA large");
    expect(level(2)).toBe("Fail");
  });

  it("shows the dimension scales", () => {
    render(<ScaleTable group="size" />);
    expect(screen.getByRole("row", { name: /size\.target/ })).toHaveTextContent(
      "44px",
    );
  });

  it("shows the type family", () => {
    render(<TypeSpecimen />);
    expect(screen.getByText(/quick brown fox/)).toBeVisible();
  });
});
