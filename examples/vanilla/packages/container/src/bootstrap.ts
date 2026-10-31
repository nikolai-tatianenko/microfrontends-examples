import { mount as mountCart } from "cart/mount";
import { mount as mountProducts } from "products/mount";

// Each remote is independent: if one fails to load, say so in its own panel and keep the other.
const show = (id: string, render: (el: Element) => void) => {
  const el = document.getElementById(id)!;
  try {
    render(el);
  } catch (error) {
    el.textContent = `Could not load: ${error instanceof Error ? error.message : String(error)}`;
  }
};

show("products-container", mountProducts);
show("cart-container", (el) => mountCart(el, 3));
