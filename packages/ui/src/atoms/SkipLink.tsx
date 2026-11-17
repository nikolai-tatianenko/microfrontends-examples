import { Link } from "@mui/material";
import type { MouseEvent } from "react";
import { useT } from "../i18n";

/** Id of the element a page marks as its content, for `SkipLink` to target. */
export const CONTENT_ID = "content";

/** Far enough above the viewport that the link is out of sight until it takes focus. */
const HIDDEN_TOP = -120;

interface SkipLinkProps {
  /** The target needs `tabIndex={-1}` so it can take focus. */
  targetId: string;
}

/**
 * First stop for keyboard and screen-reader users: jumps past the header to the content (WCAG 2.4.1).
 * Off-screen until it has focus, then drawn above everything else.
 */
export function SkipLink({ targetId }: SkipLinkProps) {
  const t = useT();
  // Move focus by hand: a bare `#hash` link would push a history entry in a router-driven app.
  const jump = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document.getElementById(targetId)?.focus();
  };

  return (
    <Link
      href={`#${targetId}`}
      onClick={jump}
      data-test-id="skip-link"
      sx={{
        position: "fixed",
        left: 8,
        top: HIDDEN_TOP,
        zIndex: "tooltip",
        px: 2,
        py: 1.5,
        borderRadius: 1,
        bgcolor: "background.paper",
        fontWeight: 600,
        "&:focus": { top: 8 },
      }}
    >
      {t("a11y.skip")}
    </Link>
  );
}
