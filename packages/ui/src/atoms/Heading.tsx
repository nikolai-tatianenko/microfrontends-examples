import { Typography, type TypographyProps } from "@mui/material";

interface HeadingProps {
  /** Semantic element, independent of the visual `variant`. */
  as?: "h1" | "h2" | "h3";
  /** Visual size. */
  variant?: TypographyProps["variant"];
  children: React.ReactNode;
}

/** Centered page/section heading. Keeps semantics (`as`) apart from looks (`variant`). */
export function Heading({ as = "h1", variant = "h2", children }: HeadingProps) {
  return (
    <Typography
      component={as}
      variant={variant}
      align="center"
      gutterBottom
      data-test-id="heading"
    >
      {children}
    </Typography>
  );
}
