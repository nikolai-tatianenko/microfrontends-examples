import faker from "faker";

/**
 * Mount function to render products
 * @param {HTMLElement} el - The element to mount the products text.
 */
const mount = (el) => {
  const cartText = `<div>${faker.random.number()} items in your cart</div>`;
  el.innerHTML = cartText;
};

/**
 * If we are in development and an element with an id of 'cart-dev' exists,
 */
if (process.env.NODE_ENV === "development") {
  const el = document.querySelector("#cart-dev");

  if (el) {
    mount(el);
  }
}

/**
 * For container development or production, export the mount function.
 */
export { mount };
