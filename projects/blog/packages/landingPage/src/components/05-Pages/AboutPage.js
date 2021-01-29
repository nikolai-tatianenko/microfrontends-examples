import React from "react";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";

import {Layout} from '@blog/components'
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
