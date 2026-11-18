# 0012 · Design tokens are the one thing every remote shares

**Status:** accepted · amends [0010](0010-shadcn-tailwind-remote.md)

## Context

The page runs three styling stacks at once: MUI (shell, `marketing`, `auth`), Tailwind with shadcn/ui (`landing`) and
plain scoped CSS in Vue (`dashboard`). [ADR 0010](0010-shadcn-tailwind-remote.md) accepted that cost and named the risk:
_tokens can drift_. They did. The same blue, the same "muted" gray and the same dark surface lived in three files, each
edited by hand when contrast went to 7:1, and each following `prefers-color-scheme` on its own, so a visitor could not
choose a mode and the remotes could not be switched together.

Sharing a component library across frameworks is not possible. Sharing the decisions underneath it is.

## Decision

1. **One source.** `packages/tokens/tokens.json`, in the [W3C Design Tokens format](https://www.designtokens.org/):
   `$type`, `$value`, `$description`, `{aliases}`, `$deprecated`. Mode values and forced-colors values sit in
   `$extensions` (`com.blog.mode`, `com.blog.forced`) because the format has no standard for modes yet.
2. **Generated, committed, checked.** `scripts/build-tokens.mjs` writes `tokens.css` (custom properties) and
   `tokens.ts` (a typed object and a `TokenPath` union). Both are committed so no consumer needs a build step, and
   `pnpm tokens:check` fails CI when they are stale. The generator is about a hundred lines, with tests; it replaces a
   dependency (Style Dictionary) whose transforms and platforms this repo has no use for.
3. **Remotes read, the shell decides.** The color mode is one attribute, `data-theme`, on `<html>`. The shell sets it
   (`@blog/tokens/mode`: stored choice, follows the OS while "system"). CSS remotes read custom properties; MUI remotes
   read the attribute through `useMode()` and build their theme from the same tokens. No remote receives theme props
   or keeps a color of its own, and the shell loads the stylesheet once. Standalone, a remote's entry plays the host.
4. **Enforced.** A unit test measures every foreground and background pair in both modes (7:1 for text, 3:1 for the
   focus ring); `pnpm tokens:lint` fails on any color literal outside the tokens package and on use of a deprecated
   token; a changeset records the size of every change to the package; `CODEOWNERS` routes it to a reviewer.
5. **Forced colors** is the third mode: under `@media (forced-colors: active)` the color tokens become system colors.

## Consequences

- ➕ A token is edited once and reaches React, Tailwind and Vue; the landing remote's palette is no longer its own.
- ➕ Contrast is a unit test (milliseconds) before it is a browser scan (minutes).
- ➕ The visitor can choose light, dark or system, and every remote follows live, mounted or not.
- ➖ The mode contract is an attribute on a global element: any code can write it. The convention (only the shell does)
  is documented, not enforced.
- ➖ `$extensions` for modes is ours. When the Design Tokens format standardises modes, `tokens.json` migrates and
  consumers do not notice, because they read the generated files.
- ➖ The landing remote changed from a monochrome shadcn palette to the brand blue, because that is what one system means.
- ➖ A flash of the wrong mode is possible before the shell's script runs; there is no blocking inline script yet.

Revisit when a remote lives in another repository: then `@blog/tokens` becomes a published package, and the changeset
bump (major for a renamed or removed token) becomes the contract that remote's team reads.
