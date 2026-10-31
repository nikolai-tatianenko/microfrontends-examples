import type { Meta, StoryObj } from "@storybook/react-vite";
import { AuthCard } from "./AuthCard";
const meta = {
  title: "Templates/AuthCard",
  component: AuthCard,
  args: { title: "Sign in", children: "form goes here" },
} satisfies Meta<typeof AuthCard>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
