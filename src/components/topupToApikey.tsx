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
import { StoringCostEstimator } from "./storingCostsEstimator";
import Divider from "@mui/joy/Divider";
import { useTranslation } from "react-i18next";
import { loadable } from "jotai/utils";

const isTopupButtonLoadingAtom = atom(false);

export function Topup() {
  const { t } = useTranslation();
  const [topupAmount, setTopupAmount] = useAtom(topupAmountAtom);
  const [, topupApikeyFn] = useAtom(topupApikeyAtom);
  const [hash, setHash] = useState<string | null>();
  const [, setIsTopupButtonLoading] = useAtom(isTopupButtonLoadingAtom);

  const handleTopup = async (event: React.FormEvent<HTMLFormElement>) => {
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
            return t("pending transaction");
          },
        },
        success: {
          render() {
            setIsTopupButtonLoading(false);
            return t("transaction has been minted");
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
    setTimeout(() => setHash(null), 2000);
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
      <AlertView hash={hash} />

      <form onSubmit={handleTopup}>
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
                fallback={
                  <Skeleton>
                    <Box>
                      <Typography>testsdt</Typography>
                    </Box>
                  </Skeleton>
                }
              >
                <TokenList />
              </Suspense>
            </>
          }
        />
        <MaxButton />
        <StoringCostEstimator />
        <Box
          sx={(theme) => ({
            marginTop: theme.spacing(2),
            gap: theme.spacing(2),
            display: "flex",
          })}
        >
          <ClearButton />
          <TopupButton />
        </Box>
      </form>
    </Box>
  );
}

function AlertView({ hash }: { hash: string | null | undefined }) {
  if (hash) {
    return (
      <Alert startDecorator={<CheckCircleIcon />} variant="soft">
        <Box>
          <Typography fontWeight="lg" mt={0.25}>
            Success
          </Typography>
          <Typography fontSize="sm" sx={{ opacity: 0.8 }}>
            transaction {hash} has been commit to everpay mainnet!
          </Typography>
        </Box>
      </Alert>
    );
  }
  return <></>;
}

function MaxButton() {
  return (
    <Suspense
      fallback={
        <Skeleton>
          <Button>Testdtsadst</Button>
        </Skeleton>
      }
    >
      <LoadableMaxButton />
    </Suspense>
  );
}

function LoadableMaxButton() {
  const { t } = useTranslation();

  const [, setTopupAmount] = useAtom(topupAmountAtom);
  const [topupTag] = useAtom(topupTagAtom);

  const [balances] = useAtom(balancesAtom);
  const max = () => {
    if (!topupTag) {
      return BigNumber(0);
    }

    const item = balances.filter((b) => b.tag === topupTag);
    if (item.length < 1) {
      return BigNumber(0);
    }

    return BigNumber(item[0].balance);
  };
  const symbol = () => {
    if (!topupTag) {
      return "";
    }
    const item = balances.filter((b) => b.tag === topupTag);
    if (item.length < 1) {
      return "";
    }

    return item[0].symbol;
  };
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
      <Button
        sx={(theme) => ({
          color: theme.palette.text.secondary,
          paddingLeft: "0",
          paddingTop: "0",
        })}
        variant="plain"
        onClick={() => {
          setTopupAmount(max());
        }}
      >
        {t("Max")}：{max().toString()}
        {symbol()}
      </Button>
    </Box>
  );
}

function ClearButton() {
  const { t } = useTranslation();

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
      {t("Clear")}
    </Button>
  );
}

const loadableBalancesAtom = loadable(balancesAtom);

function TopupButton() {
  const { t } = useTranslation();
  const [topupTag] = useAtom(topupTagAtom);
  const [balances] = useAtom(loadableBalancesAtom);
  const [topupAmount] = useAtom(topupAmountAtom);
  const [isTopupButtonLoading] = useAtom(isTopupButtonLoadingAtom);

  const isSufficinent = useMemo(() => {
    if (balances.state !== "hasData") {
      return false;
    }
    const t = balances.data.filter((b) => b.tag === topupTag);
    return t.length === 1 && BigNumber(t[0].balance).gte(topupAmount);
  }, [balances, topupTag, topupAmount]);

  const isDanger = useMemo(() => {
    return !topupTag || topupAmount.isZero() || !topupAmount || !isSufficinent;
  }, [topupTag, topupAmount, isSufficinent]);
  const isLoading = isTopupButtonLoading || balances.state === "loading";

  const btnText = () => {
    if (topupAmount.isZero()) {
      return t("Invalid Topup Amount");
    }
    if (!topupTag) {
      return t("Invalid Topup Token");
    }

    if (!isSufficinent) {
      return t("Insufficinent balance");
    }

    return t("TOPUP");
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
        <Option label={i.symbol} key={i.tag} value={i.tag}>
          <Box component="span" sx={tokenSymbolBoxStyle}>
            <Typography component="span" sx={tokenBalanceTypoStyle}>
              {i.symbol}
            </Typography>
            <Typography
              component="span"
              sx={(theme) => ({
                marginLeft: theme.spacing(2),
              })}
            >
              {i.balance}
            </Typography>
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
      sx={(theme) => ({
        border: "none",
        mr: -1.5,
        "&:hover": { bgcolor: "transparent" },
        minWidth: theme.spacing(12),
      })}
      value={topupTag}
      placeholder="Choose one Token to topup"
      onChange={handleSelectToken}
    >
      {list}
    </Select>
  );
}
