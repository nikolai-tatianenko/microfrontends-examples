import { plans } from "@blog/ui/fixtures";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { PricingPageView } from "./PricingPage";

const meta = {
  title: "Marketing/PricingPageView",
  component: PricingPageView,
  parameters: { layout: "fullscreen" },
  args: { loading: false, plans, onRetry: fn() },
} satisfies Meta<typeof PricingPageView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {};
export const Loading: Story = { args: { loading: true, plans: undefined } };
