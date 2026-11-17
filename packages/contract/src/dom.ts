/** Finds the element a micro-app mounts into, or fails with a message that names it. */
export function requireElement(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el)
    throw new Error(
      `#${id} is missing from the page, so there is nothing to mount into.`,
    );
  return el;
}
