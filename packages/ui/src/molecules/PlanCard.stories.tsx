import type { Meta, StoryObj } from "@storybook/react-vite";
import { plans } from "../__fixtures__/data";
import { PlanCard } from "./PlanCard";
const { id: _id, ...pro } = plans[1]!;
const meta = {
  title: "Molecules/PlanCard",
  component: PlanCard,
  args: pro,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlanCard>;
export default meta;
export const Highlighted: StoryObj<typeof meta> = {};
export const Standard: StoryObj<typeof meta> = { args: { highlighted: false } };
