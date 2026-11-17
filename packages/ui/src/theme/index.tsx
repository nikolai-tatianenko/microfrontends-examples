import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import { useMemo, type ReactNode } from "react";
import { I18nProvider } from "../i18n";

/** WCAG 2.5.5 (AAA): pointer targets are at least 44 by 44 CSS pixels. */
export const TARGET_SIZE = 44;

/** Per-mode colors. MUI's light defaults are 5.7:1 (secondary text) and 5:1 (errors) on white; these are above 7:1. */
const PALETTES = {
  light: {
    primary: { main: "#0d47a1" },
    error: { main: "#a31515" },
    text: { secondary: "#4d4d4d" },
  },
  dark: { primary: { main: "#90caf9" }, error: { main: "#ff8a80" } },
} as const;

/**
 * Builds the design-system theme for a color mode.
 *
 * Built to WCAG 2.2 AAA: text and controls reach a 7:1 contrast ratio on their background (1.4.6), pointer
 * targets are at least 44px (2.5.5), keyboard focus draws a 3px ring (2.4.13) and motion stops when the
 * visitor asks for less of it (2.3.3).
 */
export function createBlogTheme(mode: "light" | "dark") {
  const focusRing = {
    outline: `3px solid ${PALETTES[mode].primary.main}`,
    outlineOffset: 2,
  };
  const target = { minHeight: TARGET_SIZE, minWidth: TARGET_SIZE };
  return createTheme({
    palette: { mode, ...PALETTES[mode] },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    },
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
  /** Force a mode (Storybook, visual tests); defaults to the OS preference. */
  mode?: "light" | "dark";
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
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const resolved = mode ?? (prefersDark ? "dark" : "light");
  const theme = useMemo(() => createBlogTheme(resolved), [resolved]);

  return (
    <ThemeProvider theme={theme}>
      {baseline && <CssBaseline />}
      <I18nProvider>{children}</I18nProvider>
    </ThemeProvider>
  );
}
