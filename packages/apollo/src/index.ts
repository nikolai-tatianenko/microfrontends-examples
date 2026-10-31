import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  type NormalizedCacheObject,
} from "@apollo/client";

export interface ClientOptions {
  /** Same-origin by default: the dev server and nginx both proxy /graphql to the API. */
  uri?: string;
}

/**
 * One client per page. Remotes receive it via `mount()`, so queries from different
 * remotes land in a single normalized cache (a `Post` fetched by marketing is
 * visible to anyone else asking for it).
 */
export function createApolloClient({
  uri = "/graphql",
}: ClientOptions = {}): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    link: new HttpLink({ uri }),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { errorPolicy: "all" },
      query: { errorPolicy: "all" },
    },
  });
}
