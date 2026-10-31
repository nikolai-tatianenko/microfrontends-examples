import { Typography } from "@mui/material";
import { Layout } from "@blog/ui";

export function AboutPage() {
  return (
    <Layout title="About">
      <Typography align="center" color="text.secondary">
        This site is a shell plus three remotes (marketing, auth, dashboard)
        composed in the browser with Module Federation.
      </Typography>
    </Layout>
  );
}
