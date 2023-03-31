import { Suspense } from "react";
import { accountAtom } from "./states";
import { useAtom } from "jotai";
import Container from "@mui/material/Container";

import {
  AccountBalances,
  AccountState,
  ApikeyStatus,
  ArseedingBundler,
  StoringFees,
  Topup,
} from "./components";
import CircularProgress from "@mui/joy/CircularProgress";
import { ConnectWallet } from "./components/connectWallet";

function App() {
  const [account] = useAtom(accountAtom);
  if (!account) {
    return (
      <Container maxWidth="sm">
        <ConnectWallet />
      </Container>
    );
  }
  return (
    <Container maxWidth="sm">
      <Suspense fallback={<CircularProgress variant="solid" />}>
        <AccountState />
      </Suspense>
      <Suspense fallback={<CircularProgress variant="solid" />}>
        <ArseedingBundler />
      </Suspense>
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
    </Container>
  );
}

export default App;
