import { useMemo, useState } from "react";
import { apikeyStatusAtom, getApikeyAtom } from "../states";
import Card from "@mui/joy/Card";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import { useAtom } from "jotai";
import Box from "@mui/material/Box";
import { formatBytes } from "../tools";

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
  const [getApikeyFn] = useAtom(getApikeyAtom);
  const [apikey, setApikey] = useState<string | null>(null);

  if ("error" in apikeyStatus) {
    return (
      <div>
        record not found. topup to register current address of a apikey.
        {apikeyStatus.error}
      </div>
    );
  }

  const handleGetApikey = async () => {
    const apikey = await getApikeyFn();
    setApikey(apikey);
  };

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
        <Button onClick={handleGetApikey}>get apikey</Button>
      </Card>
    </Box>
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
