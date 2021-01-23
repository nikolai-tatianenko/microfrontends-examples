import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Layout from "../04-Templates/Layout";

export function AboutPage() {
  return (
    <Layout title={"AboutPage"}>
      <Container maxWidth="md" component="main">
        <Grid container spacing={5} alignItems="flex-end">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
          voluptatum, quibusdam, quia, quod voluptates voluptatem quos
          voluptatibus quae doloribus quas voluptate. Quisquam voluptatum.
        </Grid>
      </Container>
    </Layout>
  );
}

export default AboutPage;
