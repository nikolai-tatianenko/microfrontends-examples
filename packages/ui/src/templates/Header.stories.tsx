import { Button } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Header } from "./Header";
const meta = {
  title: "Templates/Header",
  component: Header,
  args: { isSignedIn: false, onSignOut: fn() },
} satisfies Meta<typeof Header>;
export default meta;
export const SignedOut: StoryObj<typeof meta> = {};
export const SignedIn: StoryObj<typeof meta> = { args: { isSignedIn: true } };
/** The shell passes its tour button and overlay switch through `actions`. */
export const WithActions: StoryObj<typeof meta> = {
  args: { actions: <Button size="small">Take the tour</Button> },
};
