import {
  ApolloClient,
  InMemoryCache,
  type NormalizedCacheObject,
} from "@apollo/client";
import { SchemaLink } from "@apollo/client/link/schema";
import type { GraphQLSchema } from "graphql";

/**
 * A client that executes operations directly against a real schema: no network, no hand-written mocks.
 * Integration tests use it so a renamed field or changed argument in the API fails the consuming remote's tests.
 */
export function createSchemaClient(
  schema: GraphQLSchema,
): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new SchemaLink({ schema }),
  });
}
