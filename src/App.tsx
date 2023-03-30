import { Suspense, useState } from "react";
import {
  accountsAtom,
  AmountInvalidError,
  arseedBundlerAddressAtom,
  balancesAtom,
  getApikeyAtom,
  loadableTopupToApikeyAtom,
  metamaskProviderAtom,
  statusAtom,
  TagCannotBeNullError,
  tokensInfoAtom,
  topupAmountAtom,
  topupTagAtom,
} from "./states";
import { useAtom, Provider } from "jotai";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/joy/Button";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Card from "@mui/joy/Card";
import Input from "@mui/joy/Input";

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
  const [topupTag] = useAtom(topupTagAtom);
  const [topupAmount, setTopupAmount] = useAtom(topupAmountAtom);
  const [topupFn] = useAtom(loadableTopupToApikeyAtom);
  const [hash, setHash] = useState<string | null>();

  const handleTopup = async () => {
    if (topupFn.state !== "hasData") {
      return;
    }
    const res = await topupFn.data();
    if (res instanceof AmountInvalidError) {
      console.error("amount invalid error");
      return;
    }
    if (res instanceof TagCannotBeNullError) {
      console.error("tag can not be null error");
      return;
    }
    if (res instanceof Error) {
      console.error({ me: res.message });
      return;
    }
    setHash(res.everHash);
  };
  const handleChangeAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTopupAmount(parseFloat(event.target.value));
  };

  return (
    <Box>
      <h2>Topup to arseeding</h2>
      <p>topup transaction hash: {hash}</p>
      overflow-wrap: anywhere;
      <Typography>selected token's tag: {topupTag}</Typography>
      <Typography>topup amount: {topupAmount}</Typography>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleTopup();
        }}
      >
        <Input
          type="number"
          placeholder="topup amount"
          required
          sx={{ mb: 1 }}
          defaultValue={1}
          value={topupAmount?.toString() ?? ""}
          onChange={handleChangeAmount}
          slotProps={{
            input: {
              min: 0,
              max: 5,
              step: 0.1,
            },
          }}
        />
        <Suspense fallback="loading tokenlist">
          <TokenList />
        </Suspense>
        <Button type="submit">topup</Button>
      </form>
    </Box>
  );
}

function TokenList() {
  const [tokensInfo] = useAtom(tokensInfoAtom);
  const [_, setTopupTag] = useAtom(topupTagAtom);
  const handleSelectToken = (_: any, value: string | null) => {
    setTopupTag(value);
  };
  return (
    <Select
      placeholder="Choose one Token to topup"
      onChange={handleSelectToken}
    >
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
