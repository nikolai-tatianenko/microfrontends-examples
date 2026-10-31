import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ErrorState } from "./ErrorState";
const meta = {
  title: "Atoms/ErrorState",
  component: ErrorState,
  args: { message: "The auth module could not be loaded." },
} satisfies Meta<typeof ErrorState>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
export const WithRetry: StoryObj<typeof meta> = { args: { onRetry: fn() } };
