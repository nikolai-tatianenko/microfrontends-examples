import type { Meta, StoryObj } from "@storybook/react-vite";
import "./landing.css";
import { FinalCta, Hero, LandingPage, Pillars, StackGrid } from "./LandingPage";

const meta = {
  title: "Landing/LandingPage",
  component: LandingPage,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="landing-root">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LandingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};
export const HeroSection: Story = { render: () => <Hero /> };
export const PillarsSection: Story = { render: () => <Pillars /> };
export const StackSection: Story = { render: () => <StackGrid /> };
export const CallToAction: Story = { render: () => <FinalCta /> };
