import { graphql } from "../gql";

export const PostsQuery = graphql(`
  query Posts($limit: Int) {
    posts(limit: $limit) {
      id
      title
      body
      imageUrl
    }
  }
`);

export const PlansQuery = graphql(`
  query Plans {
    plans {
      id
      name
      priceUsd
      features
      highlighted
    }
  }
`);
