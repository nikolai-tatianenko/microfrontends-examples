import type { IResolvers } from "@graphql-tools/utils";
import type { DocumentNode } from "graphql";

/**
 * A domain module: its slice of the schema plus the resolvers for it.
 * Modules never import each other; the schema is assembled in ../schema.ts.
 */
export interface ApiModule {
  typeDefs: DocumentNode;
  resolvers: IResolvers;
}
