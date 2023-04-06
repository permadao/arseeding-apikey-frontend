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
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

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
        >
          <HelpOutlineIcon />
        </IconButton>
      </Box>
      <Estimator />
      {/* <Calculator /> */}
    </Box>
  );
}

function Estimator() {
  const [fetchStoringFee] = useAtom(loadableFetchStoringFeeAtom);
  const [perGBCostInUSD] = useAtom(loadableExtractCostInUSDAtom);
  // const [storagingCostInUSDC] = useAtom(loadableFetchStoringCostInUSDCAtom);

  const [topupStoringSize] = useAtom(topupStoringSizeAtom);

  if (
    fetchStoringFee.state === "loading" ||
    perGBCostInUSD.state === "loading"
  ) {
    return <Skeleton height={200} />;
  }

  if (
    fetchStoringFee.state === "hasError" ||
    perGBCostInUSD.state === "hasError"
  ) {
    return <Typography>Storage cost load error.</Typography>;
  }
  if ("error" in fetchStoringFee.data) {
    return (
      <Typography>
        Estimating storage costs fail: {fetchStoringFee.data.error}
      </Typography>
    );
  }

  return (
    <Box
      display="grid"
      sx={(theme) => ({
        gap: theme.spacing(1),
      })}
      gridTemplateColumns="repeat(12, 1fr)"
    >
      <Item
        bytes={topupStoringSize}
        fee={fetchStoringFee.data.finalFee}
        perGBCostInUSD={perGBCostInUSD.data}
        scale={1}
        decimals={fetchStoringFee.data.decimals}
        symbol={fetchStoringFee.data.currency}
      />
      <Item
        bytes={topupStoringSize}
        fee={fetchStoringFee.data.finalFee}
        perGBCostInUSD={perGBCostInUSD.data}
        scale={2}
        decimals={fetchStoringFee.data.decimals}
        symbol={fetchStoringFee.data.currency}
      />
      <Item
        bytes={topupStoringSize}
        fee={fetchStoringFee.data.finalFee}
        perGBCostInUSD={perGBCostInUSD.data}
        scale={5}
        decimals={fetchStoringFee.data.decimals}
        symbol={fetchStoringFee.data.currency}
      />
      <Item
        bytes={topupStoringSize}
        fee={fetchStoringFee.data.finalFee}
        perGBCostInUSD={perGBCostInUSD.data}
        scale={10}
        decimals={fetchStoringFee.data.decimals}
        symbol={fetchStoringFee.data.currency}
      />
    </Box>
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

function Item({
  bytes,
  fee,
  perGBCostInUSD,
  decimals,
  scale,
  symbol,
}: {
  bytes: number;
  fee: string;
  perGBCostInUSD: string;
  decimals: string | number;
  scale: number;
  symbol: string;
}) {
  const { t } = useTranslation();

  const [, setTopupAmount] = useAtom(topupAmountAtom);
  const costInUSD = BigNumber(perGBCostInUSD).multipliedBy(scale);
  const feeNum = ethers.BigNumber.from(fee);
  const feeNumScaled = ethers.BigNumber.from(scale).mul(feeNum);
  const feeNumScaledText = formatUnits(feeNumScaled, decimals, 4);

  const handleClickBtn = () => {
    setTopupAmount(BigNumber(feeNumScaledText));
  };
  return (
    <Box
      onClick={handleClickBtn}
      sx={(theme) => ({
        cursor: "pointer",
        display: "grid",
        placeContent: "center",
        placeItems: "center",
        padding: theme.spacing(1),
        border: "1px solid #dfdfdf",
      })}
      gridColumn={{ xs: "span 12", sm: "span 6", md: "span 6", lg: "span 6" }}
    >
      <Typography>
        {t("Per")} {formatBytes(bytes * scale)}
      </Typography>
      <Typography>
        {feeNumScaledText}
        {symbol}
      </Typography>

      <Typography> ${costInUSD.toString()}</Typography>
    </Box>
  );
}
