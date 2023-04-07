import { useAtom } from "jotai";
import {
  loadableExtractCostInUSDAtom,
  loadableFetchStoringFeeAtom,
  tokensInfoAtom,
  topupAmountAtom,
  topupStoringSizeAtom,
} from "../states";
import Box from "@mui/material/Box";
import Typography from "@mui/joy/Typography";
import Skeleton from "@mui/material/Skeleton";
import BigNumber from "bignumber.js";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import IconButton from "@mui/joy/IconButton";

import * as ethers from "ethers";
import { formatUnits, formatBytes } from "../tools";
import { Input, Option, Select } from "@mui/joy";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { storingCostEstimateSizeBaseAtom } from "../states";
import { topupTokenSymbolAtom } from "../states";
import { fetchStoringFeeAtom } from "../states";
import { extractCostInUSDAtom } from "../states";

export function StoringCostEstimator() {
  const { t } = useTranslation();
  return (
    <Box
      sx={(theme) => ({
        marginTop: theme.spacing(2),
      })}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Typography level="body1">{t("Storage cost estimator")}</Typography>
        <IconButton
          sx={(theme) => ({
            color: theme.palette.text.secondary,
          })}
          variant="plain"
          size="sm"
        >
          <HelpOutlineIcon />
        </IconButton>
      </Box>
      <Estimator />
      {/* <Calculator /> */}
    </Box>
  );
}

const iters = [
  { bytes: 1073741824 / 1024, color: "#FFC10C" },
  { bytes: (1073741824 / 1024) * 200, color: "#0D6EFD" },
  {
    bytes: 1073741824 * 1,
    color: "#33CDAA",
  },
  {
    bytes: 1073741824 * 1024,
    color: "#7749F8",
  },
];

function Estimator() {
  const items = useMemo(
    () =>
      iters.map((i) => (
        <LoadableItem key={i.bytes} bytes={i.bytes} color={i.color} />
      )),
    [iters]
  );

  return (
    <Box
      display="grid"
      sx={(theme) => ({
        gap: theme.spacing(1),
      })}
      gridTemplateColumns="repeat(12, 1fr)"
    >
      {items}
    </Box>
  );
}

function LoadableItem({ bytes, color }: { bytes: number; color: string }) {
  const { t } = useTranslation();
  const [costInToken, setCostInToken] = useState<number | null>(null);
  const [, setTopupAmount] = useAtom(topupAmountAtom);

  const cursor = useMemo(
    () => (!!costInToken ? "pointer" : "default"),
    [costInToken]
  );
  const handleClick = () => {
    if (!costInToken) {
      return;
    }

    setTopupAmount(BigNumber(costInToken));
  };
  return (
    <Box
      onClick={handleClick}
      sx={(theme) => ({
        cursor,
        display: "grid",
        placeContent: "center",
        placeItems: "center",
        padding: theme.spacing(2),
        border: "1px solid #dfdfdf",
      })}
      gridColumn={{ xs: "span 12", sm: "span 6", md: "span 6", lg: "span 6" }}
    >
      <Typography
        sx={(theme) => ({
          color: theme.palette.text.secondary,
          fontSize: theme.fontSize.sm,
        })}
      >
        {t("Per")} {formatBytes(bytes)}
      </Typography>
      <Suspense
        fallback={
          <Skeleton>
            <Typography
              sx={(theme) => ({
                fontSize: theme.fontSize.lg,
                color,
              })}
            >
              0.00674992DAI
            </Typography>
          </Skeleton>
        }
      >
        <CostInToken
          color={color}
          bytes={bytes}
          setCostInToken={setCostInToken}
        />
      </Suspense>
      <Suspense
        fallback={
          <Skeleton>
            <Typography
              sx={(theme) => ({
                fontSize: theme.fontSize.sm,
              })}
            >
              $1.3496041015625
            </Typography>
          </Skeleton>
        }
      >
        <CostInUSD bytes={bytes} />
      </Suspense>
    </Box>
  );
}

function CostInUSD({ bytes }: { bytes: number }) {
  const [perGBCostInUSD] = useAtom(extractCostInUSDAtom);
  const costInUSD = ((Number(perGBCostInUSD) * bytes) / 1073741824)
    .toFixed(6)
    .toString();

  return (
    <Typography
      sx={(theme) => ({
        fontSize: theme.fontSize.sm,
      })}
    >
      {" "}
      ${costInUSD}
    </Typography>
  );
}

function CostInToken({
  bytes,
  setCostInToken,
  color,
}: {
  bytes: number;
  color: string;
  setCostInToken: (costInToken: number | null) => void;
}) {
  const [storageSizeBase] = useAtom(storingCostEstimateSizeBaseAtom);
  const [fetchStoringFee] = useAtom(fetchStoringFeeAtom);
  const [topupTokenSymbol] = useAtom(topupTokenSymbolAtom);

  const costInToken = useMemo(() => {
    if ("error" in fetchStoringFee) {
      return "0";
    }
    const fee = ethers.BigNumber.from(fetchStoringFee.finalFee)
      .mul(bytes)
      .div(storageSizeBase);
    return formatUnits(fee, fetchStoringFee.decimals, 8);
  }, [fetchStoringFee, bytes, storageSizeBase]);
  useEffect(() => setCostInToken(Number(costInToken)), [costInToken]);

  return (
    <Typography
      sx={(theme) => ({
        fontSize: theme.fontSize.lg,
        color,
      })}
    >
      {costInToken}
      {topupTokenSymbol}
    </Typography>
  );
}

function Calculator() {
  return (
    <Box
      sx={(theme) => ({
        marginTop: theme.spacing(2),
      })}
    >
      <Input
        sx={{
          paddingRight: 0,
        }}
        endDecorator={
          <Select>
            <Option>KB</Option>
            <Option>MB</Option>
            <Option>GB</Option>
          </Select>
        }
      />
      <TokensSelector />
    </Box>
  );
}

function TokensSelector() {
  const [tokensInfo] = useAtom(tokensInfoAtom);
  const tokenList = useMemo(() => {
    return tokensInfo.tokenList.map((l) => (
      <Option label={l.symbol} key={l.tag}>
        {l.symbol}
      </Option>
    ));
  }, [tokensInfo]);

  return (
    <Input
      sx={{
        paddingRight: 0,
      }}
      endDecorator={<Select>{tokenList}</Select>}
    />
  );
}
