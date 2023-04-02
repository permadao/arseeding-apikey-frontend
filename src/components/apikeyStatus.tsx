import { Suspense, useMemo, useState } from "react";
import {
  apikeyAtom,
  apikeyStatusAtom,
  getApikeyAtom,
  loadableGetApikeyFnAtom,
  signerAtom,
} from "../states";
import Card from "@mui/joy/Card";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import { atom, useAtom } from "jotai";
import Box from "@mui/material/Box";
import { formatBytes } from "../tools";
import { loadable } from "jotai/utils";

const cardStyle = () => ({
  transition: "transform 0.3s, border 0.3s, box-shadow 0.2s",
  "&:hover": {
    boxShadow: "md",
    transform: "translateY(-2px)",
    borderColor: "neutral.outlinedHoverBorder",
  },
});

export function ApikeyStatus() {
  const [apikeyStatus] = useAtom(apikeyStatusAtom);
  const [apikey, setApikey] = useAtom(apikeyAtom);

  if ("error" in apikeyStatus) {
    return (
      <div>
        record not found. topup to register current address of a apikey.
        {apikeyStatus.error}
      </div>
    );
  }

  return (
    <Box>
      <Card sx={cardStyle}>
        <Typography level="h4" sx={{ mb: 0.5 }}>
          Apikey Status:
        </Typography>
        <Typography level="body2">
          apikey: {apikey ?? "***************"}
        </Typography>
        <CapText bytes={apikeyStatus.estimateCap} />
        <Typography level="h2" fontSize="sm" sx={{ mb: 0.5 }}>
          token balances in this apikey:
        </Typography>
        <ul>
          <TokenBalanceList tokenBalance={apikeyStatus.tokenBalance} />
        </ul>
        <Suspense fallback="loading get apikey button">
          <GetApikeyButton />
        </Suspense>
      </Card>
    </Box>
  );
}

function GetApikeyButton() {
  const [isDanger, setIsDanger] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [, setApikey] = useAtom(apikeyAtom);
  const [, getApikey] = useAtom(getApikeyAtom);

  const handleGetApikey = async () => {
    try {
      setIsDanger(false);
      setLoading(true);
      const apikey = await getApikey({ signerAtom });
      setApikey(apikey);
      setIsDanger(false);
      setLoading(false);
    } catch (e) {
      setIsDanger(true);
      setLoading(false);
      throw e;
    }
  };

  return (
    <Button
      loading={loading}
      color={isDanger ? "danger" : "primary"}
      onClick={handleGetApikey}
    >
      get apikey
    </Button>
  );
}

function CapText({ bytes }: { bytes: string }) {
  const cap = useMemo(() => {
    return formatBytes(Number(bytes));
  }, [bytes]);
  return <Typography level="body2">estimate cap: {cap}</Typography>;
}

function TokenBalanceList({
  tokenBalance,
}: {
  tokenBalance: Record<string, string>;
}) {
  const balancesItem = useMemo(
    () =>
      // TODO: parse decimal here...
      Object.keys(tokenBalance).map((o) => (
        <li key={o}>
          {o}: {tokenBalance[o]}
        </li>
      )),
    [tokenBalance]
  );

  return <>{balancesItem}</>;
}
