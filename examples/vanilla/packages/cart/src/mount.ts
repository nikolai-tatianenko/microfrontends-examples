/** "1 item" / "3 items". */
export const label = (count: number) =>
  `${count} ${count === 1 ? "item" : "items"} in your cart`;

/**
 * Renders the cart summary into `el`. The host decides the count; the remote only presents it,
 * so there is no hidden randomness and the result is testable.
 */
export function mount(el: Element, count = 3): () => void {
  const summary = document.createElement("p");
  summary.dataset.testId = "cart-summary";
  summary.textContent = label(count);
  el.replaceChildren(summary);
  return () => el.replaceChildren();
}
