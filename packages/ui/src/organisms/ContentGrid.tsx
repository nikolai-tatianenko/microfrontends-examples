import { Container, Grid } from "@mui/material";
import {
  BlogPostItem,
  type BlogPostItemProps,
} from "../molecules/BlogPostItem";

/** Responsive grid of post cards (1 / 2 / 3 columns). */
export function ContentGrid({
  posts,
}: {
  posts: Array<BlogPostItemProps & { id: string }>;
}) {
  return (
    <Container maxWidth="md" sx={{ py: 8 }} data-test-id="content-grid">
      <Grid container spacing={4}>
        {posts.map(({ id, ...post }) => (
          <Grid key={id} size={{ xs: 12, sm: 6, md: 4 }}>
            <BlogPostItem {...post} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
