import Box from "@material-ui/core/Box";
import { Copyright } from "../01-Atoms/Copyright";
import React from "react";

export const Footer = ({ children }) => {
  return (
    <Box>
      {children}
      <Copyright />
    </Box>
  );
};
