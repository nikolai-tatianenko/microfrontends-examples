import type { Meta, StoryObj } from "@storybook/react-vite";
import { Copyright } from "./Copyright";
const meta = {
  title: "Atoms/Copyright",
  component: Copyright,
  args: { year: 2026 },
} satisfies Meta<typeof Copyright>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
