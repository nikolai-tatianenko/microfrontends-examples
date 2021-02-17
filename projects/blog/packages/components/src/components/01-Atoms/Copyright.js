import Typography from "@material-ui/core/Typography";
import MaterialLink from "@material-ui/core/Link";
import { Link } from "react-router-dom";
import React from "react";

/**
 *
 * @returns {JSX.Element}
 * @constructor
 */
export function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright "}
      <MaterialLink component={Link} to="/" color="inherit">
        WebSiteName
      </MaterialLink>{" "}
      {new Date().getFullYear()}
      {"."}
      {"All Rights Reserved"}
    </Typography>
  );
}
