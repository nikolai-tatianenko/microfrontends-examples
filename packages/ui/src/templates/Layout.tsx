import { Box, Container } from "@mui/material";
import type { ReactNode } from "react";
import { Heading } from "../atoms/Heading";
import { Footer } from "./Footer";

/** Page frame: title, content, footer. */
export function Layout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <Box component="main" sx={{ bgcolor: "background.paper", pt: 8, pb: 6 }}>
        <Container maxWidth="md">
          <Heading>{title}</Heading>
          {children}
        </Container>
      </Box>
      <Footer />
    </>
  );
}
