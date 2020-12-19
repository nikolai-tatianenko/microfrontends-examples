import faker from "faker";

/**
 * Mounts the products text with a random number of items.
 * @param {HTMLElement} el - The element to mount the products text.
 */
const mount = (el) => {
  let products = "";

  for (let i = 0; i < 5; i++) {
    const name = faker.commerce.productName();
    products += `<div>${name}</div>`;
  }

  el.innerHTML = products;
};

/**
 * For local development, immediately render the app.
 */
if (process.env.NODE_ENV === "development") {
  const el = document.querySelector("#dev-products");

  /**
   * If we are in development and an element with an id of 'dev-products' exists,
   */
  if (el) {
    mount(el);
  }
}

/**
 * For container development or production, export the mount function.
 */
export { mount };
