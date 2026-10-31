import { gql } from "@apollo/client";
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import { createSchemaClient } from "./testing";

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: { hello: { type: GraphQLString, resolve: () => "world" } },
  }),
});

describe("createSchemaClient", () => {
  it("executes operations against the given schema, with no network", async () => {
    const { data } = await createSchemaClient(schema).query({
      query: gql`
        {
          hello
        }
      `,
    });
    expect(data).toEqual({ hello: "world" });
  });
});
