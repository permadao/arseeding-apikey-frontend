import Container from "@mui/joy/Container";
import Typography from "@mui/joy/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { AccountState } from "./accountState";
import { Suspense } from "react";
import { CircularProgress } from "@mui/joy";

export function MyAppBar() {
  return (
    <AppBar position="sticky" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                color: "#fff",
                textDecoration: "none",
              }}
            >
              Arseeding Apikey
            </Typography>
            <Typography
              noWrap
              component="a"
              href=""
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                color: "#fff",
                textDecoration: "none",
              }}
            >
              Arseeding Apikey
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <LoadableWalletStatusBtn />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

function LoadableWalletStatusBtn() {
  return (
    <Suspense fallback={<CircularProgress variant="solid" />}>
      <Tooltip title="Open settings">
        <AccountState />
      </Tooltip>
    </Suspense>
  );
}
