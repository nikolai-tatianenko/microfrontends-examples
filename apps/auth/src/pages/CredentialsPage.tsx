import { useMutation } from "@apollo/client";
import type { SessionStore } from "@blog/contract";
import { AuthCard } from "@blog/ui";
import { CredentialsFormView } from "../components/CredentialsFormView";
import { SignInMutation, SignUpMutation } from "../graphql/operations";

/** Seeded in the API's auth module, so anyone can try the demo without signing up first. */
const DEMO_ACCOUNT = { email: "demo@example.com", password: "password123" };

const TITLES = { signin: "Sign in", signup: "Sign up" } as const;

/**
 * Sign-in and sign-up share everything but the mutation. On success the user is handed to the
 * host's session; the host decides where to go next.
 */
export function CredentialsPage({
  mode,
  session,
}: {
  mode: "signin" | "signup";
  session: SessionStore;
}) {
  const [signIn, signInState] = useMutation(SignInMutation);
  const [signUp, signUpState] = useMutation(SignUpMutation);
  const { loading, error } = mode === "signin" ? signInState : signUpState;

  const onSubmit = async (variables: { email: string; password: string }) => {
    try {
      const email =
        mode === "signin"
          ? (await signIn({ variables })).data?.signIn.email
          : (await signUp({ variables })).data?.signUp.email;
      if (email) session.signIn({ email });
    } catch {
      // surfaced through `error`
    }
  };

  return (
    <AuthCard title={TITLES[mode]}>
      <CredentialsFormView
        mode={mode}
        loading={loading}
        error={error?.message}
        demoAccount={mode === "signin" ? DEMO_ACCOUNT : undefined}
        onSubmit={onSubmit}
      />
    </AuthCard>
  );
}
