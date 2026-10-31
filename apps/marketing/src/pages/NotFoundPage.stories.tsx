import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotFoundPage } from "./NotFoundPage";

const meta = {
  title: "Marketing/NotFoundPage",
  component: NotFoundPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof NotFoundPage>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
