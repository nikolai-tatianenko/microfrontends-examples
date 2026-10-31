import { posts } from "@blog/ui/fixtures";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { LandingPageView } from "./LandingPage";

const meta = {
  title: "Marketing/LandingPageView",
  component: LandingPageView,
  parameters: { layout: "fullscreen" },
  args: { loading: false, posts, onRetry: fn() },
} satisfies Meta<typeof LandingPageView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {};
export const Loading: Story = { args: { loading: true, posts: undefined } };
export const Failed: Story = {
  args: { posts: undefined, error: "Could not reach the API." },
};
