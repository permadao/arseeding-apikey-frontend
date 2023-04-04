import { useState, Suspense, useMemo } from "react";
import {
  topupAmountAtom,
  topupTokenSymbolAtom,
  tokensInfoAtom,
  balancesAtom,
  sortedBalancesAtom,
  topupApikeyAtom,
  topupTagAtom,
  everpayAtom,
  arseedingBundlerAddressAtom,
} from "../states";
import { atom, useAtom } from "jotai";
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
import BigNumber from "bignumber.js";
import { StoringCostEstimator } from "./storingFees";
import { CircularProgress } from "@mui/joy";
import Divider from "@mui/joy/Divider";

const isTopupButtonLoadingAtom = atom(false);

export function Topup() {
  const [topupTag] = useAtom(topupTagAtom);
  const [topupAmount, setTopupAmount] = useAtom(topupAmountAtom);
  const [, topupApikeyFn] = useAtom(topupApikeyAtom);
  const [hash, setHash] = useState<string | null>();
  const [topupTokenSymbol] = useAtom(topupTokenSymbolAtom);
  const [, setIsTopupButtonLoading] = useAtom(isTopupButtonLoadingAtom);

  const testHandleTopup = async (event: React.FormEvent<HTMLFormElement>) => {
    // prevent default behavior of the Browser.
    event.preventDefault();

    const res = await toast.promise(
      async () => {
        const data = await topupApikeyFn({
          tagAtom: topupTagAtom,
          amountAtom: topupAmountAtom,
          everpayAtom: everpayAtom,
          arseedingBundlerAddressAtom,
        });
        return data;
      },
      {
        pending: {
          render() {
            setIsTopupButtonLoading(true);
            return "pending transaction";
          },
        },
        success: {
          render() {
            setIsTopupButtonLoading(false);
            return "transaction has been minted";
          },
        },
        error: {
          render(err) {
            setIsTopupButtonLoading(false);
            const error = err.data as unknown as Error;
            return error.message;
          },
        },
      }
    );
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
    <Box
      sx={{
        marginTop: "10px",
      }}
    >
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

      <form onSubmit={testHandleTopup}>
        <Input
          type="number"
          placeholder="topup amount"
          required
          sx={{ mb: 1 }}
          value={topupAmount.toNumber()}
          onChange={handleChangeAmount}
          endDecorator={
            <>
              <Divider orientation="vertical" />
              <Suspense
                fallback={<Skeleton variant="rectangular" height={50} />}
              >
                <TokenList />
              </Suspense>
            </>
          }
        />
        <Typography>
          TODO: display max balance of current token here.
        </Typography>

        <Suspense fallback={<CircularProgress variant="solid" />}>
          <StoringCostEstimator />
        </Suspense>
        <Box sx={(theme) => ({ gap: theme.spacing(2), display: "flex" })}>
          <ClearButton />
          <TopupButton />
        </Box>
      </form>
    </Box>
  );
}

function ClearButton() {
  const [, setTopupAmount] = useAtom(topupAmountAtom);
  const [, setTopupTag] = useAtom(topupTagAtom);

  const handleClearUpBtn = () => {
    setTopupAmount(BigNumber(0));
    setTopupTag(null);
  };
  return (
    <Button
      sx={(theme) => ({
        background: theme.palette.background.tooltip,
      })}
      onClick={handleClearUpBtn}
    >
      清 除
    </Button>
  );
}

function TopupButton() {
  const [topupTag] = useAtom(topupTagAtom);
  const [balances] = useAtom(balancesAtom);
  const [topupAmount] = useAtom(topupAmountAtom);
  const [isLoading] = useAtom(isTopupButtonLoadingAtom);

  const isSufficinent = useMemo(() => {
    const t = balances.filter((b) => b.tag === topupTag);
    return t.length === 1 && BigNumber(t[0].balance).gt(topupAmount);
  }, [balances, topupTag, topupAmount]);

  const isDanger = useMemo(() => {
    return !topupTag || topupAmount.isZero() || !topupAmount || !isSufficinent;
  }, [topupTag, topupAmount, isSufficinent]);

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
      sx={{ flexGrow: 1 }}
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
      sx={{ border: "none", mr: -1.5, "&:hover": { bgcolor: "transparent" } }}
      value={topupTag}
      placeholder="Choose one Token to topup"
      onChange={handleSelectToken}
    >
      {list}
    </Select>
  );
}
