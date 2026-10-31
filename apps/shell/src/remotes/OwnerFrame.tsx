import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { OWNERS, type OwnerName } from "./owners";

interface OwnerFrameProps {
  owner: OwnerName;
  /** Draw the outline and name tag. When false the children render untouched. */
  visible: boolean;
  children: ReactNode;
}

/** Outlines a region of the page and names the app that renders it. */
export function OwnerFrame({ owner, visible, children }: OwnerFrameProps) {
  if (!visible) return <>{children}</>;
  const { tech, color } = OWNERS[owner];
  return (
    <Box
      data-test-id={`owner-${owner}`}
      sx={{ outline: `2px dashed ${color}`, outlineOffset: "-2px" }}
    >
      <Box
        component="span"
        data-test-id={`owner-tag-${owner}`}
        sx={{
          display: "inline-block",
          bgcolor: color,
          color: "#fff",
          fontSize: 12,
          fontWeight: 600,
          px: 1,
          py: 0.25,
        }}
      >
        {owner} · {tech}
      </Box>
      {children}
    </Box>
  );
}
