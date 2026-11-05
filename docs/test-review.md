# Test review

All numbers below were measured on this machine
(Apple silicon, Node 22.19, pnpm 10.28.1) from the reports the gates wrote, not estimated.

## Suites and measured durations

| Layer         | Command                                              |                                                       Tests | Measured time                                                                     |
| ------------- | ---------------------------------------------------- | ----------------------------------------------------------: | --------------------------------------------------------------------------------- |
| Unit          | `pnpm test` (Jest, per module)                       |                                                          92 | not re-measured after adding `landing` and the tour (was 8.1 s across 10 modules) |
| Integration   | `pnpm test:integration`                              |                                                          24 | not re-measured (was 4.6 s summed across 5 modules)                               |
| E2E           | `pnpm e2e` (Playwright, production build, 4 workers) |                             49 (29 journeys + 20 axe scans) | 19.8 s on the latest run, 39 s to 66 s on earlier ones (4 workers)                |
| Visual + a11y | `pnpm visual:docker` (Playwright Linux image)        | 46 (12 pages, 34 stories; each story also gets an axe scan) | about 1.3 min inside the container                                                |
| Scripts       | `pnpm test:ci-scripts` (node:test)                   |                                                          22 | under 1 s                                                                         |

## Coverage

- Unit-only line coverage is 81.2% in total, but it understates modules whose behaviour is exercised
  by integration tests (`auth` 63%, `marketing` 65%, `api` 61% unit-only).
- The gate (`scripts/coverage-gate.mjs`) therefore merges unit and integration coverage per file and fails
  any file under 80%. Result: **49 of 49 files pass; the lowest is 87.5%** (`PricingPage.tsx`),
  then `LandingPage.tsx` 88.9% and `theme/index.tsx` 88.9%. Evidence: `reports/coverage-gate.json`.
- Deliberately outside the denominator (pure wiring that Jest cannot execute): app entry files
  (`src/index.ts`), `mount.ts` glue, `standalone.ts`, `bootstrap.tsx`, `server.ts`, and the shell's
  `remotes/registry.ts` and `services.ts` (federated imports and real storage). All are exercised by the
  Playwright suite, which runs the production bundles.
- Known gap: the Vue single-file component (`App.vue`, `StatTile.vue`, `ActivityList.vue`) has no Jest
  unit test because the Jest setup has no SFC transform. Its logic lives in `data.ts` and `format.ts`
  (unit and integration tested); the component itself is covered by the E2E tests in `auth.spec.ts` that land on it (sign-in, reload, logout, sign-up), by axe scans in both color schemes and by 2 visual baselines (light and dark).

## Accessibility

- axe-core (WCAG 2.0/2.1 A and AA) runs on 8 screens in light and dark (`e2e/tests/a11y.spec.ts`, 16 scans; 2 more in `tour.spec.ts` with the guided tour open) and on every
  Storybook story (`e2e/visual/storybook.spec.ts`). Any violation fails the run with the rule, impact and first element.
- It found one real defect: the not-found page's link used the browser's default blue, failing contrast on the dark theme.
  Fixed by using the themed MUI link.
- Negative control: the helper was run on a deliberately bad page and reported `image-alt`, `button-name` and `color-contrast`,
  so a clean result means axe looked and found nothing.
- Limit: automation finds only the machine-checkable part of accessibility. Keyboard order, focus management and screen-reader
  wording still need a person.

## Isolation and flakiness

- E2E was run 10 times in a row (150 test executions at the time, 4 workers): no failure after fixing one
  race **in the test itself** (flipping a fake outage off before the retry control had rendered).
- The E2E fixture fails any test on `console.error` or an uncaught exception, which caught a real 502
  from the preview proxy that no assertion noticed.
- Visual: baselines are generated only in the Playwright image, the clock is frozen, animations are
  disabled, and a run without `--update` matched all 37 images.
- Shared mutable state: the API's in-memory user store is module-level. Tests that register users use
  unique emails (`Date.now()`), so file order cannot matter; no test depends on another's data.
- Storybook's own a11y addon runs axe when a story loads, which collided with ours ("Axe is already running") and failed
  random stories. The helper now waits and retries on exactly that message, and on nothing else.
- Unit tests install a `fetch` that throws, so a missing mock fails loudly instead of reaching the network.

## Duplication found and removed

- `SignInPage` and `SignUpPage` were copy-pasted: merged into `CredentialsPage`.
- A test render helper existed twice (ui and marketing) and was hand-rebuilt in two auth tests: now one
  `renderWithProviders` exported as `@blog/ui/testing`.
- Three identical standalone bootstraps: now `runStandalone` in `@blog/contract/standalone`.
- 13 bundler configs, 8 jest configs: one `createConfig` and one `createJestConfig`.

## Bugs fixed, each with a regression test that fails without the fix

Each test was observed failing on the broken behaviour: the first four when the bug surfaced, and the
leak test was re-checked by removing the `key` props and watching it fail before restoring them.

| Bug                                                                         | Regression test                                                                    |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Remote unmounted and remounted on every navigation (`useNavigate` identity) | `RemoteHost.test.tsx` "keeps the same remote instance across host navigations"     |
| One remote's error state leaked into the next remote's route                | `Shell.int.test.tsx` "does not let one remote's failure leak"                      |
| Logout raced the router transition and landed on sign-in                    | `Shell.int.test.tsx` "lands a user on the dashboard ... guards again after logout" |
| "Try again" never recovered a failed remote                                 | `resilience.spec.ts` "a remote that is down shows a contained, retryable error"    |
| Every page fetched every remote entry at startup                            | `browse.spec.ts` "a page only fetches the remotes it uses"                         |
| Global `.who` CSS collided with a scoped rule in the Vue dashboard          | dashboard visual baselines (found by reviewing the screenshot)                     |

## Optimisation decision

No speed change is warranted: the whole unit and integration run takes about 13 s summed (a few seconds
wall with Turborepo parallelism), and E2E about 7 s wall. Optimising would risk isolation for no benefit.
The one structural improvement made was the shared Jest preset, which removed per-package configuration drift.

## Not covered, stated plainly

- Authentication is a demo: the route guard is cosmetic and the dashboard queries are not authorised on the
  server; there is no rate limiting. These are documented limits in the README, not tested guarantees.
