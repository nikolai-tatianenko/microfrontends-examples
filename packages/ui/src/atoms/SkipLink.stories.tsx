import type { Meta, StoryObj } from "@storybook/react-vite";
import { SkipLink } from "./SkipLink";

const meta = {
  title: "Atoms/SkipLink",
  component: SkipLink,
  args: { targetId: "content" },
  parameters: {
    docs: {
      description: {
        component:
          "Press Tab once: the link slides into view. Activating it moves focus to the page content.",
      },
    },
  },
  render: (args) => (
    <>
      <SkipLink {...args} />
      <div id="content" tabIndex={-1}>
        Page content
      </div>
    </>
  ),
} satisfies Meta<typeof SkipLink>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
