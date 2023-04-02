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
import { MyAppBar } from "./components/appBar";

function App() {
  const [account] = useAtom(accountAtom);

  return (
    <>
      <MyAppBar />
      <Container maxWidth="sm">
        {account ? <ConnectedView /> : <ConnectWallet />}
      </Container>
    </>
  );
}

function ConnectedView() {
  return (
    <>
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
    </>
  );
}

export default App;
