import Typography from "@material-ui/core/Typography";
import React from "react";

/**
 *
 * @param headingType
 * @param variant
 * @param children
 * @returns {JSX.Element}
 * @constructor
 */
export const Heading = ({ headingType = "h1", variant = "h1", children }) => {
  return (
    <Typography
      component={headingType}
      variant={variant ? variant : headingType}
      align="center"
      color="textPrimary"
      gutterBottom
    >
      {children}
    </Typography>
  );
};
