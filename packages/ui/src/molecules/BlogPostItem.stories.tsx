import type { Meta, StoryObj } from "@storybook/react-vite";
import { posts } from "../__fixtures__/data";
import { BlogPostItem } from "./BlogPostItem";
const { id: _id, ...post } = posts[0]!;
const meta = {
  title: "Molecules/BlogPostItem",
  component: BlogPostItem,
  args: post,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BlogPostItem>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
