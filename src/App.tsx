import { Suspense, useEffect, useState } from "react";
import {
  accountsAtom,
  arseedBundlerAddressAtom,
  arseedingBundlerAddressAtom,
  balancesAtom,
  everpayAtom,
  getApikeyAtom,
  metamaskProviderAtom,
  statusAtom,
  tokensInfoAtom,
  topupAmountAtom,
  topupTagAtom,
  topupToApikeyAtom,
} from "./states";
import { useAtom, Provider } from "jotai";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/joy/Button";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Card from "@mui/joy/Card";

function GetAccountsComponent() {
  const [accounts, setAccounts] = useAtom(accountsAtom);
  const [metamaskProvider] = useAtom(metamaskProviderAtom);

  const handleGetAccounts = async () => {
    const accounts = await metamaskProvider.request!({
      method: "eth_requestAccounts",
    });
    setAccounts(accounts);
  };
  return (
    <div>
      {accounts.length === 0 && (
        <Button onClick={handleGetAccounts}>connect wallet</Button>
      )}
    </div>
  );
}

import Typography from "@mui/joy/Typography";

function Status() {
  const [data] = useAtom(statusAtom);
  const [getApikeyFn] = useAtom(getApikeyAtom);
  const [apikey, setApikey] = useState<string | null>(null);
  if (data.error) {
    return <div>error</div>;
  }
  const handleGetApikey = async () => {
    try {
      const apikey = await getApikeyFn();
      setApikey(apikey);
    } catch (e) {
      console.error({ e });
    }
  };
  return (
    <Card
      sx={(theme) => ({
        transition: "transform 0.3s, border 0.3s, box-shadow 0.2s",
        "&:hover": {
          boxShadow: "md",
          transform: "translateY(-2px)",
          borderColor: "neutral.outlinedHoverBorder",
        },
      })}
    >
      <Typography level="h3" sx={{ mb: 0.5 }}>
        Apikey Status:
      </Typography>
      <Typography level="body2">
        apikey: {apikey ?? "***************"}
      </Typography>
      <Typography level="body2">estimate cap: {data.estimateCap}</Typography>
      <Typography level="h2" fontSize="sm" sx={{ mb: 0.5 }}>
        token balances in this apikey:
      </Typography>
      <ul>
        {Object.keys(data.tokenBalance).map((o) => (
          <li key={o}>
            {o}: {data.tokenBalance[o]}
          </li>
        ))}
      </ul>
      <Button onClick={handleGetApikey}>get apikey</Button>
    </Card>
  );
}

function CurrentAccountBalances() {
  const [accounts] = useAtom(accountsAtom);
  const [balances] = useAtom(balancesAtom);
  if (accounts.length === 0) {
    return <></>;
  }
  return (
    <div>
      <p>balances of current account({accounts[0]}) in everpay:</p>
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
  return <div>arseeding bundler address: {arseedBundlerAddress}</div>;
}
function Topup() {
  const [topupTag, setTopupTag] = useAtom(topupTagAtom);
  const [topupAmount, setTopupAmount] = useAtom(topupAmountAtom);
  const [topupFn] = useAtom(topupToApikeyAtom);
  const [arseedingBundlerAddress] = useAtom(arseedingBundlerAddressAtom);
  const [hash, setHash] = useState<string | null>();
  const [everpay] = useAtom(everpayAtom);
  const [tokenIndex, setTokenIndex] = useState<string | null>();

  const handleTopup = async () => {
    try {
      const res = await topupFn();
      setHash(res.everHash);
    } catch (e) {
      console.error({ e });
    }
  };

  return (
    <div>
      <h2>Topup to arseeding</h2>
      <p>topup transaction hash: {hash}</p>
      <Box>
        <Suspense fallback="loading tokenlist">
          <TokenList />
        </Suspense>
      </Box>
      <Button onClick={handleTopup}>topup</Button>
    </div>
  );
}

function TokenList() {
  const [tokensInfo] = useAtom(tokensInfoAtom);
  return (
    <Select>
      {tokensInfo.tokenList.map((t) => {
        return (
          <Option key={t.tag} value={t.tag}>
            {t.symbol}
          </Option>
        );
      })}
    </Select>
  );
}

function App() {
  const [accounts] = useAtom(accountsAtom);
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
        <Suspense fallback={"loading current address container..."}>
          <GetAccountsComponent />
        </Suspense>
      </Box>
      <Box>
        {accounts.length !== 0 && (
          <>
            accounts: {accounts.toString()}
            <Status />
          </>
        )}
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
