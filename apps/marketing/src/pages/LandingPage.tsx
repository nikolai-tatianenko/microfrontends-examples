import { useQuery } from "@apollo/client";
import { Button, Stack, Typography } from "@mui/material";
import { ContentGrid, ErrorState, Layout, Progress } from "@blog/ui";
import { Link } from "react-router-dom";
import { PostsQuery } from "../graphql/operations";

type Posts = React.ComponentProps<typeof ContentGrid>["posts"];

/** Presentational: everything the page needs arrives as props. */
export function LandingPageView({
  posts,
  loading,
  error,
  onRetry,
}: {
  posts?: Posts;
  loading: boolean;
  error?: string;
  onRetry: () => void;
}) {
  return (
    <Layout title="Main Page">
      <Typography variant="h5" align="center" color="text.secondary" paragraph>
        A blog assembled at runtime from independently deployed microfrontends.
      </Typography>
      <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
        <Button
          component={Link}
          to="/pricing"
          variant="contained"
          data-test-id="cta-pricing"
        >
          Pricing
        </Button>
      </Stack>
      {loading && <Progress />}
      {error && <ErrorState message={error} onRetry={onRetry} />}
      {posts && <ContentGrid posts={posts} />}
    </Layout>
  );
}

/** Container: owns the data fetching. */
export function LandingPage() {
  const { data, loading, error, refetch } = useQuery(PostsQuery, {
    variables: { limit: 6 },
  });
  return (
    <LandingPageView
      posts={data?.posts}
      loading={loading}
      error={error?.message}
      onRetry={() => void refetch()}
    />
  );
}
