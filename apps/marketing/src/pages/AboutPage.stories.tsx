import type { Meta, StoryObj } from "@storybook/react-vite";
import { AboutPage } from "./AboutPage";

const meta = {
  title: "Marketing/AboutPage",
  component: AboutPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AboutPage>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
