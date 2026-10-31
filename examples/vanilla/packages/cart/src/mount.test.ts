import { label, mount } from "./mount";

describe("cart", () => {
  it.each([
    [0, "0 items in your cart"],
    [1, "1 item in your cart"],
    [3, "3 items in your cart"],
  ])("label(%p) = %p", (count, expected) => {
    expect(label(count)).toBe(expected);
  });

  it("renders the count it is given", () => {
    const el = document.createElement("div");
    mount(el, 7);
    expect(el).toHaveTextContent("7 items in your cart");
  });
});
