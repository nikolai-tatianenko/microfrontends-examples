import gql from "graphql-tag";
import type { ApiModule } from "../types";

const STATS = [
  { id: "visitors", label: "Visitors", value: "12,480", deltaPct: 4.2 },
  { id: "signups", label: "Sign-ups", value: "342", deltaPct: 1.1 },
  { id: "revenue", label: "Revenue", value: "$8,920", deltaPct: -2.3 },
  { id: "churn", label: "Churn", value: "1.8%", deltaPct: -0.4 },
];

const ACTIVITY = [
  {
    id: "a1",
    user: "ada@example.com",
    action: "Published “Shipping a shell”",
    at: "2026-10-28T09:12:00Z",
  },
  {
    id: "a2",
    user: "linus@example.com",
    action: "Upgraded to Pro",
    at: "2026-10-28T11:40:00Z",
  },
  {
    id: "a3",
    user: "grace@example.com",
    action: "Signed up",
    at: "2026-10-29T08:05:00Z",
  },
];

export const analytics: ApiModule = {
  typeDefs: gql`
    type Stat {
      id: ID!
      label: String!
      value: String!
      deltaPct: Float!
    }

    type Activity {
      id: ID!
      user: String!
      action: String!
      at: String!
    }

    extend type Query {
      stats: [Stat!]!
      recentActivity(limit: Int): [Activity!]!
    }
  `,
  resolvers: {
    Query: {
      stats: () => STATS,
      recentActivity: (_: unknown, { limit }: { limit?: number | null }) =>
        ACTIVITY.slice(0, limit ?? ACTIVITY.length),
    },
  },
};
