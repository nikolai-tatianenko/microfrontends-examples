import Container from "@material-ui/core/Container";
import { Heading } from "../01-Atoms/Heading";
import { Footer } from "./Footer";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
}));

/**
 * Layout component.
 * @param title
 * @param children
 * @returns {JSX.Element}
 * @constructor
 */
export const Layout = ({ title, children }) => {
  const classes = useStyles();

  return (
    <>
      <main>
        <div className={classes.heroContent}>
          <Container maxWidth="sm">
            <Heading headingType="h1" variant="h2">
              {title}
            </Heading>
            {children}
          </Container>
        </div>
      </main>
      <Footer classes={classes} />
    </>
  );
};
export default Layout;
