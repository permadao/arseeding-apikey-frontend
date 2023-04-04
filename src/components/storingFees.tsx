import { useAtom } from "jotai";
import {
  loadableFetchStoringFeeAtom,
  topupAmountAtom,
  topupStoringSizeAtom,
} from "../states";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/joy/Typography";
import Skeleton from "@mui/material/Skeleton";
import BigNumber from "bignumber.js";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import IconButton from "@mui/joy/IconButton";

import * as ethers from "ethers";
import { formatUnits, formatBytes } from "../tools";

export function StoringCostEstimator() {
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
        <Typography level="body1">费用计算器</Typography>
        <IconButton variant="plain">
          <HelpOutlineIcon />
        </IconButton>
      </Box>
      <Body />
    </Box>
  );
}

function Body() {
  const [fetchStoringFee] = useAtom(loadableFetchStoringFeeAtom);
  const [topupStoringSize] = useAtom(topupStoringSizeAtom);

  if (fetchStoringFee.state === "loading") {
    return <Skeleton height={200} />;
    // return <Typography>Select a token to estimate storage cast.</Typography>;
  }
  if (fetchStoringFee.state === "hasError") {
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
    <Container>
      <MyBox
        bytes={topupStoringSize}
        fee={fetchStoringFee.data.finalFee}
        scale={1}
        decimals={fetchStoringFee.data.decimals}
        symbol={fetchStoringFee.data.currency}
      />
      <MyBox
        bytes={topupStoringSize}
        fee={fetchStoringFee.data.finalFee}
        scale={2}
        decimals={fetchStoringFee.data.decimals}
        symbol={fetchStoringFee.data.currency}
      />
      <MyBox
        bytes={topupStoringSize}
        fee={fetchStoringFee.data.finalFee}
        scale={5}
        decimals={fetchStoringFee.data.decimals}
        symbol={fetchStoringFee.data.currency}
      />
      <MyBox
        bytes={topupStoringSize}
        fee={fetchStoringFee.data.finalFee}
        scale={10}
        decimals={fetchStoringFee.data.decimals}
        symbol={fetchStoringFee.data.currency}
      />
    </Container>
  );
}

function MyBox({
  bytes,
  fee,
  decimals,
  scale,
  symbol,
}: {
  bytes: number;
  fee: string;
  decimals: string | number;
  scale: number;
  symbol: string;
}) {
  const [, setTopupAmount] = useAtom(topupAmountAtom);
  const feeNum = ethers.BigNumber.from(fee);
  const feeNumScaled = ethers.BigNumber.from(scale).mul(feeNum);
  const feeNumScaledText = formatUnits(feeNumScaled, decimals, 4);

  const handleClickBtn = () => {
    setTopupAmount(BigNumber(feeNumScaledText));
  };
  return (
    <Box
      onClick={handleClickBtn}
      sx={{
        cursor: "pointer",
        display: "inline-block",
        p: 2,
        border: "1px solid grey",
      }}
    >
      <Typography>{formatBytes(bytes * scale)}</Typography>
      <Typography>
        {feeNumScaledText}
        {symbol}
      </Typography>
    </Box>
  );
}
