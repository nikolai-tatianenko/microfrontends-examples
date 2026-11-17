import { Box, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Copyright } from "../atoms/Copyright";
import { useT } from "../i18n";
import { TARGET_SIZE } from "../theme";

/** WCAG 2.5.5: a link on its own line is a target, so it gets the design system's target size. */
const footerLink = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: TARGET_SIZE,
  minWidth: TARGET_SIZE,
} as const;

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
          sx={footerLink}
        >
          {t("footer.home")}
        </Link>
        <Link
          component={RouterLink}
          to="/about"
          color="text.primary"
          underline="hover"
          sx={footerLink}
        >
          {t("footer.about")}
        </Link>
        <Link
          component={RouterLink}
          to="/pricing"
          color="text.primary"
          underline="hover"
          sx={footerLink}
        >
          {t("footer.pricing")}
        </Link>
      </Box>
      <Copyright />
    </Box>
  );
}
