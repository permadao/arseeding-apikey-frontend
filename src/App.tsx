import { Suspense } from "react";
import { accountAtom } from "./states";
import { useAtom } from "jotai";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

import {
  AccountBalances,
  ApikeyStatus,
  ArseedingBundlerStatus,
  StoringFees,
  Topup,
} from "./components";
import CircularProgress from "@mui/joy/CircularProgress";
import { UnconnectView } from "./components/connectWallet";
import { MyAppBar } from "./components/appBar";

function App() {
  const [account] = useAtom(accountAtom);

  return (
    <Box
      display="grid"
      sx={{
        gridTemplateRows: "min-content 1fr min-content",
        height: "100%",
      }}
    >
      <MyAppBar />
      <Container maxWidth="sm">
        {account ? <ConnectedView /> : <UnconnectView />}
      </Container>
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
    <>
      <Suspense fallback={<CircularProgress variant="solid" />}>
        <AccountBalances />
      </Suspense>
      <Suspense fallback={<CircularProgress variant="solid" />}>
        <ApikeyStatus />
      </Suspense>
      <Suspense fallback={<CircularProgress variant="solid" />}>
        <StoringFees />
      </Suspense>
      <Suspense fallback={<CircularProgress variant="solid" />}>
        <Topup />
      </Suspense>
    </>
  );
}

export default App;
