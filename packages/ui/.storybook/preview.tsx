import { applyMode, type Mode } from "@blog/tokens/mode";
import "@blog/tokens/tokens.css";
import type { Decorator, Preview } from "@storybook/react-vite";
import { useLayoutEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import { UiProvider } from "../src/theme";

/** Stories have no shell, so the decorator plays its part: it sets the mode on the page, as the shell does. */
function ModeOnPage({ mode }: { mode: Mode }) {
  useLayoutEffect(() => applyMode(mode), [mode]);
  return null;
}

const withProviders: Decorator = (Story, context) => (
  <MemoryRouter>
    <ModeOnPage mode={context.globals.theme} />
    <UiProvider baseline mode={context.globals.theme}>
      <Story />
    </UiProvider>
  </MemoryRouter>
);

const preview: Preview = {
  decorators: [withProviders],
  globalTypes: {
    theme: {
      description: "Color mode",
      toolbar: {
        title: "Color mode",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  parameters: {
    layout: "padded",
    a11y: { test: "error" },
    docs: { toc: true },
    options: {
      storySort: {
        order: [
          "Foundations",
          ["Overview", "Colors", "Layout and type", "Theming", "Controls"],
          "Atoms",
          "Molecules",
          "Organisms",
          "Templates",
        ],
      },
    },
  },
};

export default preview;
