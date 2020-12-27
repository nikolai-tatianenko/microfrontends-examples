import { mount as productsMount } from "products/ProductsIndex";
import { mount as cartMount } from "cart/CartApp";

productsMount(document.querySelector("#products-container"));
cartMount(document.querySelector("#cart-container"));
