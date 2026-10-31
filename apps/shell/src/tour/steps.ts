import type { Step } from "react-joyride";

/** Every step names its route, so Back and Next both land where the step's target lives. */
export type Go = (path: string) => void;

/** `data-test-id` is the contract with the micro-apps: the tour needs no change in any remote. */
const byTestId = (id: string) => `[data-test-id="${id}"]`;

/**
 * Resolves once `selector` matches an element, or after `timeout` ms (the step then reports a missing target).
 * A remote is loaded and fetches its data after the route changes, so the target is not there yet when `go` returns.
 */
export function appears(selector: string, timeout = 15_000): Promise<void> {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const check = () => {
      if (document.querySelector(selector) || Date.now() - startedAt >= timeout)
        return resolve();
      setTimeout(check, 100);
    };
    check();
  });
}

/**
 * The tour, one step per idea: the host, the overlay, then one remote of each kind.
 * Joyride does not wait for a target once a step has a `before` hook, so each hook navigates and then waits for it.
 */
export function createSteps(go: Go): Step[] {
  const visit = (path: string, target: string) => async () => {
    go(path);
    await appears(target);
  };

  return [
    {
      target: byTestId("header-nav"),
      title: "One shell, many apps",
      content:
        "The header, this menu and the routing belong to the shell, the host app. Everything below the header is rendered by a different micro-app.",
      placement: "bottom",
      before: visit("/", byTestId("header-nav")),
    },
    {
      target: byTestId("owners-toggle"),
      title: "See who renders what",
      content:
        "Every region of the page is outlined and named after the app that renders it. Flip this switch to hide the labels.",
      placement: "bottom",
    },
    {
      target: byTestId("landing-stack"),
      title: "A Vite-built remote",
      content:
        "This page is the landing remote: React, shadcn/ui and Tailwind, built with Vite. The shell around it is built with Rspack. They only share one function, mount().",
      placement: "top",
      before: visit("/", byTestId("landing-stack")),
    },
    {
      target: byTestId("blog-post-item"),
      title: "Data through one GraphQL client",
      content:
        "The marketing remote (React and MUI) loaded these posts. The shell created the single Apollo client and handed it to every remote.",
      placement: "top",
      before: visit("/blog", byTestId("blog-post-item")),
    },
    {
      target: byTestId("signin-form"),
      title: "Now try the demo account",
      content:
        "This is the auth remote. Use the demo account, sign in, and a Vue dashboard loads next to the React apps.",
      placement: "right",
      before: visit("/auth/signin", byTestId("signin-form")),
    },
  ];
}
