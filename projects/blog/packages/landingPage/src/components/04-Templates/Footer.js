import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom"; // Assuming you have react-router-dom installed
import { makeStyles } from "@material-ui/core/styles";
import { Copyright } from "../01-Atoms/Copyright";
import React from "react";

const useStyles = makeStyles((theme) => ({
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
  menuItem: {
    marginRight: theme.spacing(2),
    textDecoration: "none",
    color: theme.palette.text.primary,
  },
}));

/**
 * Footer component
 *
 * @returns {JSX.Element}
 * @constructor
 */
export const Footer = () => {
  const classes = useStyles();

  return (
    <footer className={classes.footer}>
      <Typography
        variant="subtitle1"
        align="center"
        color="textSecondary"
        component="p"
      >
        <Link to="/" className={classes.menuItem}>
          Home
        </Link>
        <Link to="/about" className={classes.menuItem}>
          About
        </Link>
        <Link to="/pricing" className={classes.menuItem}>
          Pricing
        </Link>
      </Typography>
      <Copyright />
    </footer>
  );
};
