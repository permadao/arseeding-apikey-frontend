import Container from "@mui/joy/Container";
import Typography from "@mui/joy/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import { AccountState } from "./accountState";
import React, { Suspense } from "react";
import { CircularProgress, Option, Select } from "@mui/joy";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import TranslateIcon from "@mui/icons-material/Translate";
import { useTranslation } from "react-i18next";

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
              <Logo />
            </Box>
            <Box
              sx={{
                flexGrow: 0,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <LangSelector />
              <LoadableWalletStatusBtn />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </ElevationScroll>
  );
}

function LangSelector() {
  const { i18n, t } = useTranslation();

  const handleSelectLang = (_: any, value: string | null) => {
    const lang = () => {
      switch (value) {
        case "zh":
          return "zh";
        case "en-US":
          return "en-US";
        default:
          return "zh";
      }
    };
    i18n.changeLanguage(lang());
  };
  return (
    <Select
      onChange={handleSelectLang}
      defaultValue="zh"
      startDecorator={<TranslateIcon />}
    >
      <Option value="zh">{t("简体中文")}</Option>
      <Option value="en-US">{t("English")}</Option>
    </Select>
  );
}

function Logo() {
  return (
    <>
      <Typography
        noWrap
        component="a"
        href="/"
        sx={(theme) => ({
          mr: theme.spacing(2),
          display: { xs: "none", md: "flex" },
          fontWeight: 700,
          color: theme.palette.text.primary,
          textDecoration: "none",
          width: "min-content",
        })}
      >
        Arseeding Apikey
      </Typography>
      <Typography
        noWrap
        component="a"
        href=""
        sx={(theme) => ({
          mr: theme.spacing(2),
          display: { xs: "flex", md: "none" },
          flexGrow: 1,
          fontWeight: 700,
          color: theme.palette.text.primary,
          textDecoration: "none",
          width: "min-content",
        })}
      >
        Arseeding Apikey
      </Typography>
    </>
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
