import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { tokens, px, type Mode } from "@blog/tokens";
import { readMode, subscribeMode } from "@blog/tokens/mode";
import { useMemo, useSyncExternalStore, type ReactNode } from "react";
import { I18nProvider } from "../i18n";

/** WCAG 2.5.5 (AAA): pointer targets are at least 44 by 44 CSS pixels. */
export const TARGET_SIZE = px(tokens.light.size.target);

/** The color mode the host put on the page (see `@blog/tokens/mode`); follows the OS when there is no host. */
export function useMode(): Mode {
  return useSyncExternalStore(subscribeMode, readMode, () => "light");
}

/**
 * Builds the design-system theme for a color mode.
 *
 * Built to WCAG 2.2 AAA: text and controls reach a 7:1 contrast ratio on their background (1.4.6), pointer
 * targets are at least 44px (2.5.5), keyboard focus draws a 3px ring (2.4.13) and motion stops when the
 * visitor asks for less of it (2.3.3).
 */
export function createBlogTheme(mode: Mode) {
  const t = tokens[mode];
  const focusRing = {
    outline: `${t.size.focusRing} solid ${t.color.focus}`,
    outlineOffset: px(t.size.focusOffset),
  };
  const target = { minHeight: TARGET_SIZE, minWidth: TARGET_SIZE };
  return createTheme({
    palette: {
      mode,
      primary: {
        main: t.color.primary.default,
        contrastText: t.color.text.onPrimary,
      },
      error: { main: t.color.negative },
      success: { main: t.color.positive },
      text: { primary: t.color.text.default, secondary: t.color.text.muted },
      background: {
        default: t.color.surface.default,
        paper: t.color.surface.raised,
      },
      divider: t.color.border.default,
    },
    shape: { borderRadius: px(t.radius.md) },
    typography: { fontFamily: t.font.family.sans },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ":focus-visible": focusRing,
          "@media (prefers-reduced-motion: reduce)": {
            "*, *::before, *::after": {
              animationDuration: "0.01ms !important",
              animationIterationCount: "1 !important",
              transitionDuration: "0.01ms !important",
              scrollBehavior: "auto !important",
            },
          },
        },
      },
      // ButtonBase removes the browser outline, so the keyboard ring has to come back through its focus class.
      MuiButtonBase: {
        styleOverrides: {
          root: { "&.Mui-focusVisible": focusRing },
        },
      },
      MuiButton: { styleOverrides: { root: target } },
      MuiIconButton: { styleOverrides: { root: target } },
      MuiToggleButton: { styleOverrides: { root: target } },
      MuiFormControlLabel: {
        styleOverrides: { root: { minHeight: TARGET_SIZE } },
      },
    },
  });
}

interface UiProviderProps {
  children: ReactNode;
  /**
   * Reset global styles. Only the shell should; remotes render in their own
   * React root but share the document, so a second reset would be redundant.
   */
  baseline?: boolean;
  /** Force a mode (Storybook, tests); defaults to the one the host put on the page. */
  mode?: Mode;
}

/**
 * Theme + i18n for one React root. Emotion context does not cross roots, so the
 * shell and every React remote each render one of these.
 */
export function UiProvider({
  children,
  baseline = false,
  mode,
}: UiProviderProps) {
  const onPage = useMode();
  const resolved = mode ?? onPage;
  const theme = useMemo(() => createBlogTheme(resolved), [resolved]);

  return (
    <ThemeProvider theme={theme}>
      {baseline && <CssBaseline />}
      <I18nProvider>{children}</I18nProvider>
    </ThemeProvider>
  );
}
