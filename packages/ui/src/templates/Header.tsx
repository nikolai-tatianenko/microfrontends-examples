import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useT, type MessageKey } from "../i18n";

interface HeaderProps {
  isSignedIn: boolean;
  /** Called when the user clicks Logout. */
  onSignOut: () => void;
  /** Extra controls placed before the Login / Logout button (the shell puts its tour and overlay switch here). */
  actions?: ReactNode;
}

interface NavItem {
  to: string;
  key: MessageKey;
  id: string;
}

/** Primary navigation; Dashboard is only offered to signed-in users. */
const NAV: readonly NavItem[] = [
  { to: "/", key: "nav.home", id: "home" },
  { to: "/blog", key: "nav.blog", id: "blog" },
  { to: "/pricing", key: "nav.pricing", id: "pricing" },
  { to: "/about", key: "nav.about", id: "about" },
];
const DASHBOARD: NavItem = {
  to: "/dashboard",
  key: "nav.dashboard",
  id: "dashboard",
};

function isActive(to: string, pathname: string) {
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

/** Four tiles: the brand mark, one square per micro-app. */
function BrandMark() {
  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      aria-hidden
      sx={{ width: 28, height: 28, flexShrink: 0 }}
    >
      <rect x="2" y="2" width="9" height="9" rx="2.5" fill="#1565c0" />
      <rect x="13" y="2" width="9" height="9" rx="2.5" fill="#2e7d32" />
      <rect x="2" y="13" width="9" height="9" rx="2.5" fill="#ef6c00" />
      <rect x="13" y="13" width="9" height="9" rx="2.5" fill="#6a1b9a" />
    </Box>
  );
}

/** Top bar: brand, primary navigation, host-supplied actions and a Login / Logout button. */
export function Header({ isSignedIn, onSignOut, actions }: HeaderProps) {
  const t = useT();
  const { pathname } = useLocation();
  const items = isSignedIn ? [...NAV, DASHBOARD] : NAV;

  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: (theme) => `${theme.palette.background.default}d9`,
        backdropFilter: "saturate(180%) blur(12px)",
      }}
      data-test-id="header"
    >
      <Toolbar sx={{ gap: 2, flexWrap: "wrap", py: { xs: 1, md: 0 } }}>
        <Box
          component={RouterLink}
          to="/"
          data-test-id="header-brand"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "text.primary",
            textDecoration: "none",
          }}
        >
          <BrandMark />
          <Typography variant="h6" component="span" noWrap fontWeight={700}>
            {t("app.name")}
          </Typography>
        </Box>

        <Box
          component="nav"
          aria-label={t("nav.primary")}
          data-test-id="header-nav"
          sx={{
            display: "flex",
            gap: 0.5,
            flexGrow: 1,
            order: { xs: 3, md: 0 },
            width: { xs: "100%", md: "auto" },
            overflowX: "auto",
          }}
        >
          {items.map(({ to, key, id }) => {
            const active = isActive(to, pathname);
            return (
              <Button
                key={to}
                component={RouterLink}
                to={to}
                color={active ? "primary" : "inherit"}
                aria-current={active ? "page" : undefined}
                data-test-id={`header-nav-${id}`}
                sx={{
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? "action.selected" : "transparent",
                  textTransform: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {t(key)}
              </Button>
            );
          })}
        </Box>

        {actions}

        {isSignedIn ? (
          <Button
            variant="outlined"
            component={RouterLink}
            to="/"
            onClick={onSignOut}
            data-test-id="header-logout"
          >
            {t("nav.logout")}
          </Button>
        ) : (
          <Button
            variant="contained"
            disableElevation
            component={RouterLink}
            to="/auth/signin"
            data-test-id="header-login"
          >
            {t("nav.login")}
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
