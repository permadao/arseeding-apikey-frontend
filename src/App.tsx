import { Suspense, useState } from "react";
import {
  accountAtom,
  AmountInvalidError,
  arseedBundlerAddressAtom,
  balancesAtom,
  getApikeyAtom,
  loadableConnectWalletFnAtom,
  loadableTopupToApikeyAtom,
  statusAtom,
  TagCannotBeNullError,
  tokensInfoAtom,
  topupAmountAtom,
  topupTagAtom,
  topupTokenSymbolAtom,
} from "./states";
import { useAtom } from "jotai";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/joy/Button";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Card from "@mui/joy/Card";
import Input from "@mui/joy/Input";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/joy/Typography";
import Alert from "@mui/joy/Alert";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { toast } from "react-toastify";

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
      sx={() => ({
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
  const [account] = useAtom(accountAtom);
  const [balances] = useAtom(balancesAtom);
  return (
    <div>
      <p>balances of current account({account}) in everpay:</p>
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
  const [topupTokenSymbol] = useAtom(topupTokenSymbolAtom);

  const handleTopup = async () => {
    if (topupFn.state !== "hasData") {
      return;
    }
    const res = await toast.promise(topupFn.data, {
      pending: "pending transaction",
      success: "transaction has been mint",
      error: "transaction failed",
    });
    if (res instanceof AmountInvalidError) {
      toast("amount invalid error");
      return;
    }
    if (res instanceof TagCannotBeNullError) {
      toast("tag can not be null error");
      return;
    }
    if (res instanceof Error) {
      toast(`unknow error: ${res.message}`);
      console.error(res);
      // report error message here.
      return;
    }
  };
  const handleChangeAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = event.target.value;
    setTopupAmount(amount as unknown as number);
  };

  return (
    <Box>
      <h2>Topup to arseeding</h2>
      {hash && (
        <Alert startDecorator={<CheckCircleIcon />} variant="soft">
          <div>
            <Typography fontWeight="lg" mt={0.25}>
              Success
            </Typography>
            <Typography fontSize="sm" sx={{ opacity: 0.8 }}>
              transaction {hash} has been commit to everpay mainnet!
            </Typography>
          </div>
        </Alert>
      )}

      <Typography>selected token's tag: {topupTag}</Typography>
      <Typography>
        topup amount: {topupAmount}
        {topupTokenSymbol}
      </Typography>
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
          value={topupAmount}
          onChange={handleChangeAmount}
          // slotProps={null}
        />
        <Suspense fallback={<Skeleton variant="rectangular" height={50} />}>
          <TokenList />
        </Suspense>
        <Button loading={topupFn.state === "loading"} type="submit">
          topup
        </Button>
      </form>
    </Box>
  );
}

function TokenList() {
  const [tokensInfo] = useAtom(tokensInfoAtom);
  const [, setTopupTokenSymbol] = useAtom(topupTokenSymbolAtom);
  const [topupTag, setTopupTag] = useAtom(topupTagAtom);
  const handleSelectToken = (_: any, value: string | null) => {
    setTopupTag(value);
    const res = tokensInfo.tokenList.filter((i) => i.tag === value);
    if (res.length === 1) {
      setTopupTokenSymbol(res[0].symbol);
    }
  };
  return (
    <Select
      value={topupTag}
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
