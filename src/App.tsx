import { Suspense } from "react";
import {
  accountAtom,
  arseedBundlerAddressAtom,
  balancesAtom,
  loadableConnectWalletFnAtom,
} from "./states";
import { useAtom } from "jotai";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";
import { Status, Topup } from "./components";

function CurrentAccountBalances() {
  const [account] = useAtom(accountAtom);
  const [balances] = useAtom(balancesAtom);
  return (
    <div>
      <Typography>
        balances of current account({account}) in everpay:
      </Typography>
      <ul>
        {balances.map((b) => (
          <li key={b.tag}>
            {b.symbol}: {b.balance}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ArseedingBundler() {
  const [arseedBundlerAddress] = useAtom(arseedBundlerAddressAtom);
  return (
    <Typography>arseeding bundler address: {arseedBundlerAddress}</Typography>
  );
}

function GetAccountsComponent() {
  const [, setAccount] = useAtom(accountAtom);
  const [connectWalletFn] = useAtom(loadableConnectWalletFnAtom);

  const handleGetAccounts = async () => {
    if (connectWalletFn.state === "hasData") {
      const accounts = await connectWalletFn.data();
      setAccount(accounts[0]);
    }
  };
  return (
    <Button
      loading={connectWalletFn.state === "loading"}
      onClick={handleGetAccounts}
    >
      connect wallet
    </Button>
  );
}

function App() {
  const [account] = useAtom(accountAtom);

  if (!account) {
    return (
      <Container maxWidth="sm">
        <Box>
          <GetAccountsComponent />
        </Box>
      </Container>
    );
  }
  return (
    <Container maxWidth="sm">
      <Box>
        <Suspense fallback="loading arseeding bundler address">
          <ArseedingBundler />
        </Suspense>
      </Box>
      <Box>
        <Suspense fallback="loading balances of current account">
          <CurrentAccountBalances />
        </Suspense>
      </Box>
      <Box>
        <Status />
      </Box>
      <Box>
        <Suspense fallback="loading topup component...">
          <Topup />
        </Suspense>
      </Box>
    </Container>
  );
}

export default App;
