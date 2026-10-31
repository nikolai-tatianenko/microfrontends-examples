import { appears, createSteps } from "./steps";

describe("tour steps", () => {
  it("targets elements by data-test-id, so no remote needs to change for the tour", () => {
    for (const step of createSteps(jest.fn())) {
      expect(step.target).toMatch(/^\[data-test-id="[\w-]+"\]$/);
    }
  });

  it("navigates to the route each step lives on before showing it", async () => {
    const go = jest.fn();
    const steps = createSteps(go);
    // The targets are on the page already, so each hook can finish straight away.
    for (const step of steps) {
      const el = document.createElement("div");
      const id = /"([\w-]+)"/.exec(String(step.target))?.[1];
      expect(id).toBeDefined();
      el.setAttribute("data-test-id", id ?? "");
      document.body.append(el);
    }
    const routes: Array<string | undefined> = [];
    for (const step of steps) {
      go.mockClear();
      await step.before?.({} as never);
      routes.push(go.mock.calls[0]?.[0]);
    }
    // header, overlay switch (same page as the previous step), landing, marketing, auth
    expect(routes).toEqual(["/", undefined, "/", "/blog", "/auth/signin"]);
  });

  it("ends on the sign-in step, where the demo account is offered", () => {
    const steps = createSteps(jest.fn());
    expect(steps.at(-1)?.target).toBe('[data-test-id="signin-form"]');
  });

  describe("appears", () => {
    afterEach(() => (document.body.innerHTML = ""));

    it("resolves at once when the element is already there", async () => {
      document.body.innerHTML = '<p id="here"></p>';
      await expect(appears("#here", 1000)).resolves.toBeUndefined();
    });

    it("waits for an element a remote renders later", async () => {
      const done = jest.fn();
      const waiting = appears("#late", 2000).then(done);
      await new Promise((r) => setTimeout(r, 250));
      expect(done).not.toHaveBeenCalled();

      document.body.innerHTML = '<p id="late"></p>';
      await waiting;
      expect(done).toHaveBeenCalledTimes(1);
    });

    it("gives up after the timeout instead of hanging the tour", async () => {
      await expect(appears("#never", 150)).resolves.toBeUndefined();
    });
  });
});
