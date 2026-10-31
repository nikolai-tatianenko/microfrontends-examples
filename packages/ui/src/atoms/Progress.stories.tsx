import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress } from "./Progress";
const meta = { title: "Atoms/Progress", component: Progress } satisfies Meta<
  typeof Progress
>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
