import { Alert, Box, Button, Link as MuiLink, TextField } from "@mui/material";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

export interface CredentialsFormViewProps {
  mode: "signin" | "signup";
  /** A request is in flight. */
  loading: boolean;
  /** Server-side error to display. */
  error?: string;
  onSubmit: (credentials: { email: string; password: string }) => void;
  /** Ready-made account offered under the form (sign-in only); one click fills the fields. */
  demoAccount?: { email: string; password: string };
}

const COPY = {
  signin: {
    submit: "Sign In",
    switchTo: "/auth/signup",
    switchLabel: "Don't have an account? Sign Up",
    autocomplete: "current-password",
  },
  signup: {
    submit: "Sign Up",
    switchTo: "/auth/signin",
    switchLabel: "Already have an account? Sign In",
    autocomplete: "new-password",
  },
} as const;

/** Email + password form shared by sign-in and sign-up. Client checks mirror the API's rules. */
export function CredentialsFormView({
  mode,
  loading,
  error,
  onSubmit,
  demoAccount,
}: CredentialsFormViewProps) {
  const copy = COPY[mode];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);

  const emailError = !/^\S+@\S+\.\S+$/.test(email)
    ? "Enter a valid email address."
    : undefined;
  const passwordError =
    password.length < 8 ? "Password must be at least 8 characters." : undefined;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!emailError && !passwordError) onSubmit({ email, password });
  };

  return (
    <Box
      component="form"
      onSubmit={submit}
      noValidate
      sx={{ width: "100%", mt: 1 }}
      data-test-id={`${mode}-form`}
    >
      <TextField
        margin="normal"
        required
        fullWidth
        label="Email Address"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={touched && !!emailError}
        helperText={touched ? emailError : undefined}
        slotProps={{ htmlInput: { "data-test-id": "email" } }}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        label="Password"
        name="password"
        type="password"
        autoComplete={copy.autocomplete}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={touched && !!passwordError}
        helperText={touched ? passwordError : undefined}
        slotProps={{ htmlInput: { "data-test-id": "password" } }}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 1 }} data-test-id="form-error">
          {error}
        </Alert>
      )}
      {demoAccount && (
        <Alert
          severity="info"
          sx={{ mt: 1 }}
          data-test-id="demo-account"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setEmail(demoAccount.email);
                setPassword(demoAccount.password);
              }}
              data-test-id="demo-fill"
            >
              Use
            </Button>
          }
        >
          Demo account: {demoAccount.email} / {demoAccount.password}
        </Alert>
      )}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        sx={{ mt: 3, mb: 2 }}
        data-test-id="submit"
      >
        {copy.submit}
      </Button>
      <MuiLink
        component={Link}
        to={copy.switchTo}
        variant="body2"
        data-test-id={`${mode}-switch`}
      >
        {copy.switchLabel}
      </MuiLink>
    </Box>
  );
}
