# 0005 · Four test layers; visual baselines only from a Linux container

**Status:** accepted

## Decision

| Layer         | Tool                                                                           | Where                                                    |
| ------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------- |
| Unit          | Jest + Testing Library                                                         | `*.test.ts(x)` beside the code                           |
| Integration   | Jest, real schema via `SchemaLink`; shell with fake remotes                    | `*.int.test.ts(x)`                                       |
| E2E           | Playwright against the **production build**                                    | `e2e/tests`                                              |
| Visual        | Playwright screenshots (pages + one per Storybook story)                       | `e2e/visual`                                             |
| Accessibility | axe-core (WCAG 2.1 A/AA) on key pages in both color schemes and on every story | `e2e/tests/a11y.spec.ts`, `e2e/visual/storybook.spec.ts` |

- `TEST_KIND=unit|integration` selects the Jest run, so each writes its own JUnit report to
  `reports/<kind>/<module>/` for the PR table.
- E2E fails on **any** `console.error` or uncaught exception unless the test declares it expected.
- Pixel output differs between macOS and Linux (fonts, anti-aliasing). Baselines are therefore generated **only**
  in the official Playwright image (`pnpm visual:update`), which is the same image CI uses. The script copies
  the repo into the container so it never overwrites the host's `node_modules`.
- The clock is frozen in visual tests (the footer prints the year), and animations are disabled.
- Unit tests install a `fetch` that throws, so an unmocked network call fails loudly.

## Consequences

- ➖ The Vue single-file component has no Jest unit test (no SFC transform in the Jest setup). Its logic is in
  plain TS (`data.ts`, `format.ts`) which is tested, and the component is covered by E2E and visual tests.
- ➖ Updating baselines needs Docker. A CI workflow can do it for you on a PR.
