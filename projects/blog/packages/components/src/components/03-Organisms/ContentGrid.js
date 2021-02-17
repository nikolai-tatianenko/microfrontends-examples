import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { BlogPostItem } from "../02-Molecules/BlogPostItem";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
}));

/**
 * Show content in a grid.
 * @param contentList
 * @returns {JSX.Element}
 * @constructor
 */
export const ContentGrid = ({ contentList }) => {
  const classes = useStyles();

  return (
    <Container className={classes.cardGrid} maxWidth="md">
      <Grid container spacing={4}>
        {contentList.map((product, key) => (
          <Grid item key={key} xs={12} sm={6} md={4}>
            <BlogPostItem product={product} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
