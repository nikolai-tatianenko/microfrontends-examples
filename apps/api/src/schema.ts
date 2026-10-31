import { makeExecutableSchema } from "@graphql-tools/schema";
import gql from "graphql-tag";
import { analytics } from "./modules/analytics";
import { auth } from "./modules/auth";
import { billing } from "./modules/billing";
import { posts } from "./modules/posts";
import type { ApiModule } from "./modules/types";

/** Add a domain by adding it here. Nothing else changes. */
export const modules: ApiModule[] = [posts, billing, analytics, auth];

const root = gql`
  type Query
`;

export const schema = makeExecutableSchema({
  typeDefs: [root, ...modules.map((m) => m.typeDefs)],
  resolvers: modules.map((m) => m.resolvers),
});
