import { PRODUCTS } from "./products";

/**
 * Renders the product list into `el`. Plain DOM, no framework, no shared dependencies.
 * Returns a function that removes what was rendered.
 */
export function mount(el: Element): () => void {
  const list = document.createElement("ul");
  list.dataset.testId = "products-list";
  for (const name of PRODUCTS) {
    const item = document.createElement("li");
    item.textContent = name; // textContent, never innerHTML: names are data, not markup
    list.append(item);
  }
  el.replaceChildren(list);
  return () => el.replaceChildren();
}
