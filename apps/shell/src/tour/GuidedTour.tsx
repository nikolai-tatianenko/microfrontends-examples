import { useTheme } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EVENTS, Joyride, type EventHandler } from "react-joyride";
import { createSteps } from "./steps";

interface GuidedTourProps {
  /** Called once when the tour finishes or is skipped. */
  onEnd: () => void;
}

/**
 * The product tour. It lives in the shell because it crosses micro-apps and only the host knows every route.
 * Mount it to start the tour, unmount it to stop; remounting starts again from the first step.
 */
export function GuidedTour({ onEnd }: GuidedTourProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = useTheme();

  // `go` must stay stable: new steps on every navigation would make Joyride restart its step.
  const current = useRef(pathname);
  useEffect(() => {
    current.current = pathname;
  }, [pathname]);
  const go = useCallback(
    (path: string) => {
      if (path !== current.current) navigate(path);
    },
    [navigate],
  );
  const steps = useMemo(() => createSteps(go), [go]);

  const onEvent: EventHandler = (data) => {
    if (data.type === EVENTS.TOUR_END) onEnd();
  };

  return (
    <Joyride
      run
      continuous
      steps={steps}
      onEvent={onEvent}
      locale={{
        back: "Back",
        next: "Next",
        last: "Finish",
        skip: "Skip tour",
        close: "Close tour",
        nextWithProgress: "Next ({current} of {total})",
      }}
      options={{
        showProgress: true,
        skipBeacon: true,
        buttons: ["back", "skip", "primary"],
        closeButtonAction: "skip",
        overlayClickAction: false,
        // A step's `before` hook waits for a remote to load; give it longer than the 5 s default.
        beforeTimeout: 20_000,
        zIndex: theme.zIndex.tooltip + 100,
        primaryColor: theme.palette.primary.main,
        backgroundColor: theme.palette.background.paper,
        arrowColor: theme.palette.background.paper,
        textColor: theme.palette.text.primary,
        overlayColor: "rgba(0, 0, 0, 0.6)",
      }}
    />
  );
}
