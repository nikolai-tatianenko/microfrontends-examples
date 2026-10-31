import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import { useMemo, type ReactNode } from "react";
import { I18nProvider } from "../i18n";

/** Builds the design-system theme for a color mode. */
export function createBlogTheme(mode: "light" | "dark") {
  return createTheme({
    palette: {
      mode,
      primary: { main: mode === "dark" ? "#90caf9" : "#1565c0" },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
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
