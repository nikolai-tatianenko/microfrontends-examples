import type { Meta, StoryObj } from "@storybook/react-vite";
import { plans } from "../__fixtures__/data";
import { PricingGrid } from "./PricingGrid";
const meta = {
  title: "Organisms/PricingGrid",
  component: PricingGrid,
  args: { plans },
} satisfies Meta<typeof PricingGrid>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
