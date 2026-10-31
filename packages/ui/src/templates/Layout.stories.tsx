import type { Meta, StoryObj } from "@storybook/react-vite";
import { Layout } from "./Layout";
const meta = {
  title: "Templates/Layout",
  component: Layout,
  args: { title: "About", children: "Page content goes here." },
} satisfies Meta<typeof Layout>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
