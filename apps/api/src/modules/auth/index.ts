import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { GraphQLError } from "graphql";
import gql from "graphql-tag";
import type { ApiModule } from "../types";

interface Credentials {
  email: string;
  password: string;
}

const hash = (password: string, salt: Buffer) => scryptSync(password, salt, 32);

/** In-memory demo user store. Real persistence would sit behind this same interface. */
const users = new Map<string, { salt: Buffer; hash: Buffer }>();

function register({ email, password }: Credentials) {
  const salt = randomBytes(16);
  users.set(email.toLowerCase(), { salt, hash: hash(password, salt) });
}

register({ email: "demo@example.com", password: "password123" });

const invalid = (message: string) =>
  new GraphQLError(message, { extensions: { code: "BAD_USER_INPUT" } });

function validate({ email, password }: Credentials) {
  if (!/^\S+@\S+\.\S+$/.test(email))
    throw invalid("Enter a valid email address.");
  if (password.length < 8)
    throw invalid("Password must be at least 8 characters.");
}

export const auth: ApiModule = {
  typeDefs: gql`
    type AuthPayload {
      email: String!
    }

    extend type Query {
      _authPing: Boolean!
    }

    type Mutation {
      signIn(email: String!, password: String!): AuthPayload!
      signUp(email: String!, password: String!): AuthPayload!
    }
  `,
  resolvers: {
    Query: { _authPing: () => true },
    Mutation: {
      signIn(_: unknown, args: Credentials) {
        validate(args);
        const record = users.get(args.email.toLowerCase());
        const ok =
          record &&
          timingSafeEqual(record.hash, hash(args.password, record.salt));
        if (!ok)
          throw new GraphQLError("Invalid email or password.", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        return { email: args.email.toLowerCase() };
      },
      signUp(_: unknown, args: Credentials) {
        validate(args);
        if (users.has(args.email.toLowerCase()))
          throw invalid("An account with this email already exists.");
        register(args);
        return { email: args.email.toLowerCase() };
      },
    },
  },
};
