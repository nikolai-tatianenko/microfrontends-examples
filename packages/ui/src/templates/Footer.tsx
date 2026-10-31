import { Box, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Copyright } from "../atoms/Copyright";
import { useT } from "../i18n";

/** Site footer: primary links plus the copyright line. */
export function Footer() {
  const t = useT();
  return (
    <Box
      component="footer"
      sx={{ p: 6, bgcolor: "background.paper" }}
      data-test-id="footer"
    >
      <Box
        component="nav"
        aria-label="Footer"
        sx={{ display: "flex", justifyContent: "center", gap: 3, mb: 2 }}
      >
        <Link
          component={RouterLink}
          to="/"
          color="text.primary"
          underline="hover"
        >
          {t("footer.home")}
        </Link>
        <Link
          component={RouterLink}
          to="/about"
          color="text.primary"
          underline="hover"
        >
          {t("footer.about")}
        </Link>
        <Link
          component={RouterLink}
          to="/pricing"
          color="text.primary"
          underline="hover"
        >
          {t("footer.pricing")}
        </Link>
      </Box>
      <Copyright />
    </Box>
  );
}
