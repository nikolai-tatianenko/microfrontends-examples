# 0011 · The guided tour lives in the shell, not in a remote

**Status:** accepted

## Context

A first-time visitor sees five micro-apps and nothing says so. The page needs a short tour: here is the host, here is
what each region is, here is a remote built differently, here is the demo account. The tour crosses routes and
therefore crosses micro-apps.

## Decision

The tour (`react-joyride` 3, `apps/shell/src/tour`) belongs to **the shell**, the only app that knows every route.

- **Steps point at `data-test-id`s.** Every interactive element already has one, so no remote changed to make the tour
  possible, and a renamed id breaks a unit test (`steps.test.ts`) before it breaks a visitor.
- **It opens once, by itself.** The bootstrap reads a `localStorage` flag, passes `autoStartTour` to the shell and
  marks the flag straight away, so a reload mid-tour does not start it again. "Take the tour" in the header replays it.
  If storage throws (private windows) the answer is "seen": a tour that cannot remember would greet every page load.
- **The "Show micro-apps" switch moved into the header** next to the tour button. As a floating panel it covered
  content, and it is the same idea as the tour: show who renders what.

### What it took: Joyride does not wait for a target once a step has a `before` hook

Moving between remotes means navigating, and a remote loads and fetches its data _after_ the route changes. Joyride
waits for a target only when a step has no `before` hook; with one, it runs the hook and then checks the target
**once**. The first version navigated in `before` and the step was silently skipped (`Target not mounted`, 3 ms
later), which unit tests did not catch because every target was already on their page. Now each hook navigates and
then waits for its target (`appears` in `steps.ts`, up to 15 s), and a unit test renders a remote that shows its
target 600 ms after the route changes. It fails without the wait.

## Consequences

- The tour is host code; a remote cannot start or extend it. Fine while one team owns the shell; if remotes should
  contribute steps, the contract would need a way to register them.
- Tour copy is English only, in one file, like the landing's `copy.ts`.
- E2E tests must say they are a "returning" visitor, or the tour covers every page: the fixture sets the flag
  unless a test sets `tourSeen: false`.
- The overlay and tooltip pass the axe scan in both colour schemes (`e2e/tests/tour.spec.ts`).

## Revisit when

Remotes need to describe themselves in the tour, or the tour has to be translated.
