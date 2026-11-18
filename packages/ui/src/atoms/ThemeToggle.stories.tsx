import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { ModePreference } from "@blog/tokens/mode";
import { ThemeToggle } from "./ThemeToggle";

const meta = {
  title: "Atoms/ThemeToggle",
  component: ThemeToggle,
  args: { value: "system", onChange: () => {} },
  parameters: {
    docs: {
      description: {
        component:
          "Light, dark or follow the system. It only reports the choice; the shell stores it and sets `data-theme` on the page, which every remote follows.",
      },
    },
  },
} satisfies Meta<typeof ThemeToggle>;
export default meta;
type Story = StoryObj<typeof meta>;

export const System: Story = {};
export const Dark: Story = { args: { value: "dark" } };
export const Interactive: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<ModePreference>(args.value);
    return <ThemeToggle value={value} onChange={setValue} />;
  },
};
