import { mount } from "./mount";

const root = document.getElementById("root");
if (!root) throw new Error("#root is missing from index.html");

mount(root);
