import LockOutlined from "@mui/icons-material/LockOutlined";
import { Avatar, Box, Container, Typography } from "@mui/material";
import type { ReactNode } from "react";

/** Centered card frame shared by the sign-in and sign-up forms. */
export function AuthCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Container component="main" maxWidth="xs" data-test-id="auth-card">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          {title}
        </Typography>
        {children}
      </Box>
    </Container>
  );
}
