import { requireElement } from "./dom";

describe("requireElement", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("returns the element with that id", () => {
    document.body.innerHTML = '<div id="root"></div>';
    expect(requireElement("root")).toBe(document.getElementById("root"));
  });

  it("names the missing element instead of failing later on null", () => {
    expect(() => requireElement("root")).toThrow("#root is missing");
  });
});
