import { useState, Suspense } from "react";
import {
  topupTagAtom,
  topupAmountAtom,
  loadableTopupToApikeyAtom,
  topupTokenSymbolAtom,
  tokensInfoAtom,
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
