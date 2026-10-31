import type { Meta, StoryObj } from "@storybook/react-vite";
import { posts } from "../__fixtures__/data";
import { ContentGrid } from "./ContentGrid";
const meta = {
  title: "Organisms/ContentGrid",
  component: ContentGrid,
  args: { posts },
} satisfies Meta<typeof ContentGrid>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
