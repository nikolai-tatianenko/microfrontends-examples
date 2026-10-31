import { AuthCard } from "@blog/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { CredentialsFormView } from "./CredentialsFormView";

const meta = {
  title: "Auth/CredentialsFormView",
  component: CredentialsFormView,
  args: { mode: "signin", loading: false, onSubmit: fn() },
  decorators: [
    (Story, { args }) => (
      <AuthCard title={args.mode === "signin" ? "Sign in" : "Sign up"}>
        <Story />
      </AuthCard>
    ),
  ],
} satisfies Meta<typeof CredentialsFormView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {};
export const WithDemoAccount: Story = {
  args: {
    demoAccount: { email: "demo@example.com", password: "password123" },
  },
};
export const SignUp: Story = { args: { mode: "signup" } };
export const ServerError: Story = {
  args: { error: "Invalid email or password." },
};
export const Submitting: Story = { args: { loading: true } };
