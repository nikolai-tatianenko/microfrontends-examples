import type { Services } from "@blog/contract";
import { Header, useT } from "@blog/ui";
import { Box, Button, FormControlLabel, Switch } from "@mui/material";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { OwnerFrame } from "./remotes/OwnerFrame";
import { RemoteRoute } from "./remotes/RemoteRoute";
import type { RemoteRegistry } from "./remotes/registry";
import { GuidedTour } from "./tour/GuidedTour";

interface ShellProps {
  services: Services;
  remotes: RemoteRegistry;
  /** Open the guided tour on first render (the bootstrap does this once per visitor). */
  autoStartTour?: boolean;
}

/**
 * Routing, the auth guard and the header.
 *
 * Each RemoteRoute is keyed by remote: React Router renders every route element at the same tree
 * position, so without keys one remote's error-boundary state would leak into the next remote.
 * Knows remotes only by name and by the mount contract. */
export function Shell({
  services,
  remotes,
  autoStartTour = false,
}: ShellProps) {
  const { session } = services;
  const user = useSyncExternalStore(session.subscribe, session.getUser);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const t = useT();
  const [showOwners, setShowOwners] = useState(true);
  // A number, not a boolean: each start is a new key, so the tour always begins at its first step.
  const [tourRun, setTourRun] = useState<number | null>(
    autoStartTour ? 1 : null,
  );

  // Signing in from the auth remote lands the user on the dashboard.
  const wasSignedIn = useRef(user !== null);
  useEffect(() => {
    if (user && !wasSignedIn.current && pathname.startsWith("/auth"))
      navigate("/dashboard", { replace: true });
    wasSignedIn.current = user !== null;
  }, [user, pathname, navigate]);

  // The session updates synchronously but the router commits navigation as a transition, so for one
  // render a user who just logged out is "signed out on /dashboard". Send them home rather than to the
  // sign-in form; only a visitor who was never signed in gets the form.
  const endedSession = useRef(false);
  if (user) endedSession.current = true;
  useEffect(() => {
    if (!user && !pathname.startsWith("/dashboard"))
      endedSession.current = false;
  }, [user, pathname]);

  return (
    <>
      {/* Sticky here, not in Header: the owner frame is Header's parent and a sticky box cannot leave its parent. */}
      <Box sx={{ position: "sticky", top: 0, zIndex: "appBar" }}>
        <OwnerFrame owner="shell" visible={showOwners}>
          <Header
            isSignedIn={user !== null}
            onSignOut={session.signOut}
            actions={
              <>
                <Button
                  size="small"
                  onClick={() => setTourRun((n) => (n ?? 0) + 1)}
                  data-test-id="tour-start"
                >
                  {t("tour.start")}
                </Button>
                <FormControlLabel
                  label={t("owners.toggle")}
                  sx={{ m: 0 }}
                  control={
                    <Switch
                      size="small"
                      checked={showOwners}
                      onChange={(e) => setShowOwners(e.target.checked)}
                      slotProps={{
                        input: { "data-test-id": "owners-toggle" } as object,
                      }}
                    />
                  }
                />
              </>
            }
          />
        </OwnerFrame>
      </Box>
      <Routes>
        <Route
          path="/auth/*"
          element={
            <RemoteRoute
              key="auth"
              name="auth"
              load={remotes.auth}
              services={services}
              showOwner={showOwners}
            />
          }
        />
        <Route
          path="/dashboard/*"
          element={
            user ? (
              <RemoteRoute
                key="dashboard"
                name="dashboard"
                load={remotes.dashboard}
                services={services}
                showOwner={showOwners}
              />
            ) : (
              <Navigate
                to={endedSession.current ? "/" : "/auth/signin"}
                replace
              />
            )
          }
        />
        <Route
          path="/"
          element={
            <RemoteRoute
              key="landing"
              name="landing"
              load={remotes.landing}
              services={services}
              showOwner={showOwners}
            />
          }
        />
        <Route
          path="*"
          element={
            <RemoteRoute
              key="marketing"
              name="marketing"
              load={remotes.marketing}
              services={services}
              showOwner={showOwners}
            />
          }
        />
      </Routes>
      {tourRun !== null && (
        <GuidedTour key={tourRun} onEnd={() => setTourRun(null)} />
      )}
    </>
  );
}
