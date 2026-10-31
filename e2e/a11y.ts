import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

const ALREADY_RUNNING = /already running/i;

/**
 * Storybook's own a11y addon runs axe when a story iframe loads. axe allows one run at a time, so ours can
 * collide with it. That is a timing overlap, not a finding: wait for the other run to finish and retry.
 */
async function analyze(build: () => AxeBuilder) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await build().analyze();
    } catch (error) {
      if (attempt >= 8 || !ALREADY_RUNNING.test(String(error))) throw error;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
}

/**
 * Fails on any WCAG 2.0/2.1 A or AA violation. Each failure names the rule, its impact and the first
 * offending element, so the fix is obvious from the test output.
 */
export async function expectNoA11yViolations(page: Page, scope?: string) {
  const { violations } = await analyze(() => {
    const builder = new AxeBuilder({ page }).withTags([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
    ]);
    return scope ? builder.include(scope) : builder;
  });
  const summary = violations.map(
    (v) =>
      `${v.id} (${v.impact}): ${v.nodes.length} node(s), e.g. ${v.nodes[0]?.target.join(" ")}`,
  );
  expect(summary, "accessibility violations").toEqual([]);
}
