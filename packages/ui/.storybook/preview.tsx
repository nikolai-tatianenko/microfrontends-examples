import type { Decorator, Preview } from "@storybook/react-vite";
import { MemoryRouter } from "react-router-dom";
import { UiProvider } from "../src/theme";

const withProviders: Decorator = (Story, context) => (
  <MemoryRouter>
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
        icon: "circlehollow",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  parameters: { layout: "padded", a11y: { test: "error" } },
};

export default preview;
