import Container from "@mui/joy/Container";
import Typography from "@mui/joy/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { AccountState } from "./accountState";
import React, { Suspense } from "react";
import { CircularProgress } from "@mui/joy";
import useScrollTrigger from "@mui/material/useScrollTrigger";

export function MyAppBar() {
  return (
    <ElevationScroll>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "transparent",
        }}
      >
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
                  fontWeight: 700,
                  color: "#000",
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
                  fontWeight: 700,
                  color: "#000",
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
    </ElevationScroll>
  );
}

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
  children: React.ReactElement;
}

function ElevationScroll(props: Props) {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: window ? window() : undefined,
  });

  if (trigger) {
    return React.cloneElement(children, {
      sx: {
        background: "rgba( 255, 255, 255, 0.5)",
        backdropFilter: "blur( 16px )",
      },
    });
  }
  return <>{children}</>;
}

function LoadableWalletStatusBtn() {
  return (
    <Suspense fallback={<CircularProgress variant="solid" />}>
      <AccountState />
    </Suspense>
  );
}
