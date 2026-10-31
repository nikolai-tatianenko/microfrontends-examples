import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading } from "./Heading";
const meta = {
  title: "Atoms/Heading",
  component: Heading,
  args: { children: "Pricing" },
} satisfies Meta<typeof Heading>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
export const AsSectionHeading: StoryObj<typeof meta> = {
  args: { as: "h2", variant: "h4" },
};
