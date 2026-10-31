import gql from "graphql-tag";
import type { ApiModule } from "../types";
import { cover } from "./cover";

const POSTS = [
  {
    id: "1",
    title: "Shipping a shell",
    body: "How the host composes remotes at runtime.",
  },
  {
    id: "2",
    title: "Contracts over imports",
    body: "Why remotes never import each other.",
  },
  {
    id: "3",
    title: "One cache, many remotes",
    body: "Sharing an Apollo client through mount().",
  },
  {
    id: "4",
    title: "Independent deploys",
    body: "Hashed chunks, a single mutable remoteEntry.",
  },
  {
    id: "5",
    title: "Failing in isolation",
    body: "A dead remote must not take the shell down.",
  },
  {
    id: "6",
    title: "Pixels as a test oracle",
    body: "Visual regression without flakiness.",
  },
];

export const posts: ApiModule = {
  typeDefs: gql`
    type Post {
      id: ID!
      title: String!
      body: String!
      imageUrl: String!
    }

    extend type Query {
      posts(limit: Int): [Post!]!
    }
  `,
  resolvers: {
    Query: {
      posts: (_: unknown, { limit }: { limit?: number | null }) =>
        POSTS.slice(0, limit ?? POSTS.length).map((post) => ({
          ...post,
          imageUrl: cover(post.id),
        })),
    },
  },
};
