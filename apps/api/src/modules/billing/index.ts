import gql from "graphql-tag";
import type { ApiModule } from "../types";

const PLANS = [
  {
    id: "free",
    name: "Free",
    priceUsd: 0,
    features: ["1 project", "Community support"],
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    priceUsd: 15,
    features: ["20 projects", "Email support"],
    highlighted: true,
  },
  {
    id: "team",
    name: "Team",
    priceUsd: 30,
    features: ["Unlimited projects", "Phone support"],
    highlighted: false,
  },
];

export const billing: ApiModule = {
  typeDefs: gql`
    type Plan {
      id: ID!
      name: String!
      priceUsd: Int!
      features: [String!]!
      highlighted: Boolean!
    }

    extend type Query {
      plans: [Plan!]!
    }
  `,
  resolvers: { Query: { plans: () => PLANS } },
};
