import { useState, Suspense, useMemo } from "react";
import {
  topupTagAtom,
  topupAmountAtom,
  loadableTopupToApikeyAtom,
  topupTokenSymbolAtom,
  tokensInfoAtom,
  balancesAtom,
  sortedBalancesAtom,
} from "../states";
import { useAtom } from "jotai";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Button from "@mui/joy/Button";
import Alert from "@mui/joy/Alert";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Typography from "@mui/joy/Typography";
import Skeleton from "@mui/material/Skeleton";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";

export function Topup() {
  const [topupTag] = useAtom(topupTagAtom);
  const [topupAmount, setTopupAmount] = useAtom(topupAmountAtom);
  const [topupFn] = useAtom(loadableTopupToApikeyAtom);
  const [hash, setHash] = useState<string | null>();
  const [topupTokenSymbol] = useAtom(topupTokenSymbolAtom);

  const handleTopup = async (event: React.FormEvent<HTMLFormElement>) => {
    // prevent default behavior of the Browser.
    event.preventDefault();
    if (topupFn.state !== "hasData") {
      return;
    }
    const res = await toast.promise(topupFn.data, {
      pending: "pending transaction",
      success: "transaction has been minted",
      error: {
        render(err) {
          const error = err.data as unknown as Error;
          return error.message;
        },
      },
    });
    setHash(res.everHash);
  };
  const handleChangeAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // seems not need to check here...
    if (!value || value.trim() === "") {
      setTopupAmount(BigNumber(0));
      return;
    }
    setTopupAmount(BigNumber(value));
  };

  return (
    <Box>
      <Typography level="h4">Topup to arseeding</Typography>
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
        topup amountd: {topupAmount.toString()}
        {topupTokenSymbol}
      </Typography>
      <form onSubmit={handleTopup}>
        <Input
          type="number"
          placeholder="topup amount"
          required
          sx={{ mb: 1 }}
          value={topupAmount.toNumber()}
          onChange={handleChangeAmount}
        />
        <Suspense fallback={<Skeleton variant="rectangular" height={50} />}>
          <TokenList />
        </Suspense>
        <TopupButton />
      </form>
    </Box>
  );
}

function TopupButton() {
  const [topupTag] = useAtom(topupTagAtom);
  const [balances] = useAtom(balancesAtom);
  const [topupAmount] = useAtom(topupAmountAtom);
  const [topupFn] = useAtom(loadableTopupToApikeyAtom);

  const isSufficinent = useMemo(() => {
    const t = balances.filter((b) => b.tag === topupTag);
    return t.length === 1 && BigNumber(t[0].balance).gt(topupAmount);
  }, [balances, topupTag, topupAmount]);

  const isDanger = useMemo(() => {
    return !topupTag || topupAmount.isZero() || !topupAmount || !isSufficinent;
  }, [topupTag, topupAmount, isSufficinent]);

  const isLoading = topupFn.state === "loading";

  const btnText = () => {
    if (topupAmount.isZero()) {
      return "Invalid topup amount";
    }
    if (!topupTag) {
      return "Invalid topup token";
    }

    if (!isSufficinent) {
      return "Insufficinent balance";
    }

    return "TOPUP";
  };

  return (
    <Button
      color={isDanger ? "danger" : "primary"}
      disabled={isDanger}
      loading={isLoading}
      type="submit"
    >
      {btnText()}
    </Button>
  );
}

const tokenSymbolBoxStyle = {
  justifyContent: "flex-start",
  alignItems: "center",
  display: "flex",
  width: "100%",
};
const tokenBalanceTypoStyle = {
  justifyContent: "flex-start",
  alignItems: "center",
  display: "flex",
  flexGrow: 1,
};

function TokenList() {
  const [sortedBalances] = useAtom(sortedBalancesAtom);
  const [tokensInfo] = useAtom(tokensInfoAtom);
  const [, setTopupTokenSymbol] = useAtom(topupTokenSymbolAtom);
  const [topupTag, setTopupTag] = useAtom(topupTagAtom);

  const list = useMemo(() => {
    return sortedBalances.map((i) => {
      return (
        <Option key={i.tag} value={i.tag}>
          <Box component="span" sx={tokenSymbolBoxStyle}>
            <Typography component="span" sx={tokenBalanceTypoStyle}>
              {i.symbol}
            </Typography>
            {i.balance}
          </Box>
        </Option>
      );
    });
  }, [sortedBalances]);

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
      {list}
    </Select>
  );
}
