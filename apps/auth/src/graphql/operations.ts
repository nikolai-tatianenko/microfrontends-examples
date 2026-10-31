import { graphql } from "../gql";

export const SignInMutation = graphql(`
  mutation SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      email
    }
  }
`);

export const SignUpMutation = graphql(`
  mutation SignUp($email: String!, $password: String!) {
    signUp(email: $email, password: $password) {
      email
    }
  }
`);
