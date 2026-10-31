declare module "products/mount" {
  export function mount(el: Element): () => void;
}
declare module "cart/mount" {
  export function mount(el: Element, count?: number): () => void;
}
