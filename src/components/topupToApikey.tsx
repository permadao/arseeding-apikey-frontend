import { useState, Suspense } from "react";
import {
  topupTagAtom,
  topupAmountAtom,
  loadableTopupToApikeyAtom,
  topupTokenSymbolAtom,
  tokensInfoAtom,
  balancesAtom,
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

export function Topup() {
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
    const amount = parseFloat(event.target.value);
    setTopupAmount(amount);
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
  const [topupAmount] = useAtom(topupAmountAtom);
  const [topupFn] = useAtom(loadableTopupToApikeyAtom);
  const isDanger = !topupTag || topupAmount === 0 || !topupAmount;
  const btnText = () => {
    if (topupAmount === 0) {
      return "Invalid topup amount.";
    }
    if (!topupTag) {
      return "Invalid topup token.";
    }
    return "TOPUP";
  };
  return (
    <Button
      color={isDanger ? "danger" : "primary"}
      disabled={isDanger}
      loading={topupFn.state === "loading"}
      type="submit"
    >
      {btnText()}
    </Button>
  );
}

function TokenList() {
  const [balances] = useAtom(balancesAtom);
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
        // time costly.
        const b = balances.filter((i) => i.tag === t.tag)[0];
        return (
          <Option key={t.tag} value={t.tag}>
            <Box
              component="span"
              sx={{
                justifyContent: "flex-start",
                alignItems: "center",
                display: "flex",
                width: "100%",
              }}
            >
              <Typography
                component="span"
                sx={{
                  justifyContent: "flex-start",
                  alignItems: "center",
                  display: "flex",
                  flexGrow: 1,
                }}
              >
                {t.symbol}
              </Typography>
              {b?.balance}
            </Box>
          </Option>
        );
      })}
    </Select>
  );
}
