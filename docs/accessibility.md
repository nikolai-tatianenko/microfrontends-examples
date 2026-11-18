# Accessibility

The target is **WCAG 2.2 level AAA wherever it applies to this product**, in both color schemes. The W3C advises against
claiming AAA for a whole site, because some AAA criteria cannot be met for all content (for example a reading level
for every sentence). So this page says what is built, what is checked by a machine, and what still needs a person.

## What is built, and where it is checked

| Criterion                                | What the code does                                                                                              | Checked by                                                                                                                |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1.4.6 Contrast (enhanced), 7:1           | Design tokens (`packages/tokens`), read by the MUI theme, the landing remote and the dashboard                  | `packages/tokens/src/contrast.test.ts` (every pair, both modes) and `e2e/tests/a11y.spec.ts`: axe `wcag2aaa` on 9 screens |
| 2.5.5 Target size (enhanced), 44 by 44px | MUI buttons, icon buttons and form labels, the footer links and the shadcn buttons of the landing remote        | `e2e/tests/a11y-aaa.spec.ts` measures every control on five screens                                                       |
| 2.4.1 Bypass blocks                      | `SkipLink` is the first tab stop and moves focus to the content without touching the URL                        | `e2e/tests/a11y-aaa.spec.ts` and the component test                                                                       |
| 2.4.7, 2.4.13 Focus visible, appearance  | A 3px ring on every focusable element, including MUI buttons, which would otherwise lose their outline          | `e2e/tests/a11y-aaa.spec.ts` tabs through the pricing page and checks each indicator                                      |
| 2.3.3 Animation from interactions        | `prefers-reduced-motion: reduce` shortens every animation and transition to 0.01ms                              | `e2e/tests/a11y-aaa.spec.ts` emulates the setting and reads the running animations                                        |
| 1.3.1, 4.1.2 Structure and names         | Landmarks, one `main` per page, named controls, `jsx-a11y` rules in ESLint, axe best-practice rules in the scan | `pnpm lint`, `e2e/tests/a11y.spec.ts` and the Storybook a11y addon (`test: "error"`)                                      |

The scan fails on any violation, and nothing is skipped by default. The one exception is `heading-order` on the guided
tour's tooltip: react-joyride chooses the heading level and offers no option for it. The reason is written next to the call in
`e2e/tests/tour.spec.ts`.

The "Show micro-apps" labels are decorative annotations for people watching the demo, so they are `aria-hidden`. Assistive
technology gets the same structure from the landmarks.

## What a machine cannot show, and is not claimed

- **Screen-reader wording and reading order** were not tested with VoiceOver, NVDA or JAWS. Run them before a release.
- **3.1.5 Reading level** and **1.4.8 Visual presentation** (line length, spacing, justified text) are content decisions that
  are not measured here.
- **2.2.x timing** criteria hold only because the app has no time limits; the guided tour can be skipped at any step.
- Windows high-contrast mode (`forced-colors`) is covered only by what a browser can emulate: `e2e/tests/theme.spec.ts` checks that the color tokens become system colors and that the focus ring stays visible. How each page looks in a real high-contrast theme was not reviewed by eye.

## Run it

```bash
pnpm build && pnpm e2e e2e/tests/a11y.spec.ts e2e/tests/a11y-aaa.spec.ts
pnpm storybook          # the a11y panel scans each story as it loads
```
