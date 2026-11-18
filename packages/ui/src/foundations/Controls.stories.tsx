import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const meta = {
  title: "Foundations/Controls",
  parameters: {
    docs: {
      description: {
        component:
          "Every form control in each state, so a change to a token or to the theme shows up in one place, in both modes. Hover, focus and error states are captured by the visual tests.",
      },
    },
  },
} satisfies Meta;
export default meta;

export const AllStates: StoryObj<typeof meta> = {
  render: () => (
    <Stack spacing={3} sx={{ maxWidth: 480 }}>
      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
        <Button variant="contained" data-test-id="state-contained">
          Contained
        </Button>
        <Button variant="outlined" data-test-id="state-outlined">
          Outlined
        </Button>
        <Button variant="text" data-test-id="state-text">
          Text
        </Button>
        <Button variant="contained" disabled>
          Disabled
        </Button>
        <Button variant="contained" color="error">
          Destructive
        </Button>
        <IconButton aria-label="Delete" data-test-id="state-icon">
          <DeleteIcon />
        </IconButton>
      </Stack>
      <TextField label="Email" defaultValue="reader@example.com" />
      <TextField
        label="Password"
        type="password"
        error
        helperText="Use at least 8 characters."
      />
      <TextField label="Read only" defaultValue="Locked" disabled />
      <Stack direction="row" spacing={3}>
        <FormControlLabel
          label="Subscribe"
          control={<Checkbox defaultChecked />}
        />
        <FormControlLabel
          label="Notify me"
          control={<Switch defaultChecked />}
        />
      </Stack>
    </Stack>
  ),
};
