# 0010 · A remote may use its own styling stack, if it stays scoped

**Status:** accepted

## Context

The shell and the `marketing` and `auth` remotes share MUI through `@blog/ui`. The home page (`landing`) is the
first thing a visitor sees and the natural place to show a different, current stack: **shadcn/ui on Tailwind v4**.
Independent teams choosing their own tools is a core claim of microfrontends, so the demo should prove it rather
than assert it. The risk is CSS: all remotes share one document, and Tailwind's default setup resets every
element on the page.

## Decision

`landing` is a new React remote (`apps/landing`, route `/`) styled with shadcn/ui components and Tailwind v4.
Its CSS cannot leak because of three rules, all in `src/landing.css`:

1. **No global reset.** Only Tailwind's `theme` and `utilities` layers are imported, never `preflight`. The few
   reset rules the utilities rely on (box-sizing, border style, heading and list margins) are scoped to `.landing-root`.
2. **Tokens are scoped.** shadcn's CSS variables (`--background`, `--primary`, ...) live on `.landing-root`, not `:root`.
3. **Utilities only match classes the app writes.** MUI and Emotion generate hashed class names, and the Vue remote
   uses scoped CSS, so a Tailwind utility cannot hit another remote's element.

`landing` is built with Vite and `@tailwindcss/vite` ([ADR 0009](0009-rspack.md)); every Rspack app also gets the
`@/` alias shadcn components are written against.
`landing` shares only `react`, `react-dom`, `react-router-dom` and `@apollo/client`; it does not load MUI or `@blog/ui`.

Dark mode follows `prefers-color-scheme`, the same source the MUI theme uses.

## Consequences

- ➕ The demo shows heterogeneous stacks (MUI, Vue, shadcn/Tailwind) behind one typed contract.
- ➕ Verified: the visual baselines of every other page and Storybook story did not change when `landing` was added,
  so nothing leaked; axe passes on `/` in both color schemes.
- ➕ shadcn components are copied into the repo (`src/components/ui`), so they can be changed without a fork.
- ➖ A second styling system to maintain. The design system (`@blog/ui`) does not serve `landing`, so tokens can drift.
- ➖ The landing remote's stylesheet stays in the document after navigating away (style tags are not removed on
  unmount); rule 3 is what makes that harmless.
- ➖ Shadow DOM would isolate more strongly, but Tailwind v4 relies on `@property` registrations, which browsers
  only honour at document level. Not tried here; revisit if a remote needs a reset of its own.

## Revisit when

Several remotes want Tailwind: extract shared tokens and the `cn` helper into a package. Or a second team needs
a global reset: move that remote into Shadow DOM.
