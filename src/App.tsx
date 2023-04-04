import { Suspense } from "react";
import { accountAtom } from "./states";
import { useAtom } from "jotai";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Divider from "@mui/joy/Divider";
import {
  AccountBalances,
  ApikeyStatus,
  ArseedingBundlerStatus,
  Topup,
} from "./components";
import CircularProgress from "@mui/joy/CircularProgress";
import { UnconnectView } from "./components/connectWallet";
import { MyAppBar } from "./components/appBar";
import { Typography } from "@mui/joy";

function App() {
  const [account] = useAtom(accountAtom);

  return (
    <Box
      display="grid"
      sx={{
        gridTemplateRows: "min-content 1fr min-content",
        minHeight: "100vh",
        background: "linear-gradient(90deg, #F3FFFC 0%, #FAF4FC 92.08%)",
      }}
    >
      <MyAppBar />
      {account ? <ConnectedView /> : <UnconnectView />}
      <Container maxWidth="lg">
        <Suspense fallback={<CircularProgress variant="solid" />}>
          <ArseedingBundlerStatus />
        </Suspense>
      </Container>
    </Box>
  );
}

function ConnectedView() {
  return (
    <Box>
      {/* <Suspense fallback={<CircularProgress variant="solid" />}>
        <AccountBalances />
      </Suspense> */}
      <Suspense fallback={<CircularProgress variant="solid" />}>
        <ApikeyStatus />
      </Suspense>
      <Container sx={{ marginTop: "16px" }} maxWidth="lg">
        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
          <Start />
          <End />
        </Box>
      </Container>
    </Box>
  );
}

function Start() {
  return (
    <Box
      sx={(theme) => ({
        padding: theme.spacing(3),
        background: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
      })}
      gridColumn={{ xs: "span 12", md: "span 6", lg: "span 6" }}
    >
      <Typography level="h4">充值</Typography>
      <Suspense fallback={<CircularProgress variant="solid" />}>
        <Topup />
      </Suspense>
    </Box>
  );
}

function End() {
  return (
    <Box
      sx={(theme) => ({
        padding: theme.spacing(3),
        background: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
      })}
      gridColumn={{ xs: "span 12", md: "span 6", lg: "span 6" }}
    >
      grid container 2
    </Box>
  );
}
export default App;
