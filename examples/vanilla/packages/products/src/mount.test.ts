import { mount } from "./mount";
import { PRODUCTS } from "./products";

describe("products mount", () => {
  it("renders one list item per product, as text", () => {
    const el = document.createElement("div");
    mount(el);
    expect([...el.querySelectorAll("li")].map((li) => li.textContent)).toEqual([
      ...PRODUCTS,
    ]);
  });

  it("replaces previous content and cleans up after itself", () => {
    const el = document.createElement("div");
    el.textContent = "loading";
    const unmount = mount(el);
    expect(el).not.toHaveTextContent("loading");
    unmount();
    expect(el).toBeEmptyDOMElement();
  });
});
