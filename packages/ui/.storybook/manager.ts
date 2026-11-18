import { tokens } from "@blog/tokens";
import { addons } from "storybook/manager-api";
import { create } from "storybook/theming/create";

const { color, font } = tokens.light;

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "Blog design system",
    brandUrl: "https://github.com/nikolai-tatianenko/microfrontends-examples",
    colorPrimary: color.primary.default,
    colorSecondary: color.primary.default,
    appBg: color.surface.muted,
    appContentBg: color.surface.default,
    textColor: color.text.default,
    fontBase: font.family.sans,
  }),
});
