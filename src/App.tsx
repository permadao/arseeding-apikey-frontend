import { Suspense } from "react";
import { accountAtom, arseedBundlerAddressAtom, balancesAtom } from "./states";
import { useAtom } from "jotai";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/joy/Typography";
import { Status, Topup } from "./components";
import { ConnectWallet } from "./components/connectWallet";
import CircularProgress from "@mui/joy/CircularProgress";
import { AccountBalances } from "./components/accountBalances";

function ArseedingBundler() {
  const [arseedBundlerAddress] = useAtom(arseedBundlerAddressAtom);
  return (
    <Box>
      <Typography>arseeding bundler address: {arseedBundlerAddress}</Typography>
    </Box>
  );
}

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
    <Suspense fallback={<CircularProgress variant="solid" />}>
      <Container maxWidth="sm">
        <Suspense fallback={<CircularProgress variant="solid" />}>
          <ArseedingBundler />
        </Suspense>
        <Suspense fallback={<CircularProgress variant="solid" />}>
          <AccountBalances />
        </Suspense>
        <Status />
        <Suspense fallback={<CircularProgress variant="solid" />}>
          <Topup />
        </Suspense>
      </Container>
    </Suspense>
  );
}

export default App;
