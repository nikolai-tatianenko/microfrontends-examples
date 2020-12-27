import React from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";

import { commerce, image, lorem } from "faker";
import { ContentGrid } from "../03-Organisms/ContentGrid";
import { Layout } from "../05-Pages/Layout";

const useStyles = makeStyles((theme) => ({
  "@global": {
    a: {
      textDecoration: "none",
    },
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
}));

const productsList = Array.from({ length: 9 }).map(() => {
  const productName = commerce.productName();
  return {
    image: {
      src: image.image(),
      alt: productName,
    },
    title: productName,
    body: lorem.sentence(),
  };
});
export default function LandingPage() {
  const classes = useStyles();

  return (
    <>
      <Layout title="Main Page">
        <Typography variant="h5" align="center" color="textSecondary" paragraph>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eu
          sapien sit amet lectus aliquet mollis. Nulla facilisi. Nulla facilisi.
          Nulla facilisi. Nulla facilisi. Nulla facilisi.
        </Typography>
        <div className={classes.heroButtons}>
          <Grid container spacing={2} justify="center">
            <Grid item>
              <Link to="/pricing">
                <Button variant="contained" color="primary">
                  Pricing
                </Button>
              </Link>
            </Grid>
          </Grid>
        </div>
        <ContentGrid classes={classes} contentList={productsList} />
      </Layout>
    </>
  );
}
