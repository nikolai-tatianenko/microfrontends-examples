import { Link as MuiLink } from "@mui/material";
import { Layout } from "@blog/ui";
import { Link } from "react-router-dom";

/** Shown for any path the marketing remote does not own. */
export function NotFoundPage() {
  return (
    <Layout title="Page not found">
      {/* MUI Link takes its color from the theme, so contrast holds in light and dark. */}
      <MuiLink component={Link} to="/" data-test-id="not-found-home">
        Back to the home page
      </MuiLink>
    </Layout>
  );
}
