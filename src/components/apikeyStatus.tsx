import { Suspense, useMemo, useState } from "react";
import {
  apikeyAtom,
  apikeyStatusAtom,
  getApikeyAtom,
  signerAtom,
} from "../states";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import { useAtom } from "jotai";
import Box from "@mui/material/Box";
import { formatBytes } from "../tools";
import { Container } from "@mui/joy";
import Tooltip from "@mui/joy/Tooltip";
import { toast } from "react-toastify";

export function ApikeyStatus() {
  const [apikeyStatus] = useAtom(apikeyStatusAtom);

  if ("error" in apikeyStatus) {
    return (
      <Container
        sx={(theme) => ({
          marginTop: theme.spacing(2),
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: theme.palette.text.secondary,
        })}
        maxWidth="lg"
      >
        <Typography>Topup to register current address a apikey.</Typography>
        <Typography>{apikeyStatus.error}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={(theme) => ({
          marginTop: theme.spacing(2),
          background: theme.palette.background.paper,
          padding: theme.spacing(3),
          boxShadow: theme.shadows[1],
          borderRadius: theme.shape.borderRadius,
        })}
      >
        <Typography level="h4" sx={{ mb: 0.5 }}>
          Apikey 状态
        </Typography>

        <ApikeyContainer />

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
      </Box>
    </Container>
  );
}

function ApikeyContainer() {
  const [apikey] = useAtom(apikeyAtom);

  if (!apikey) {
    return <Typography level="body2">apikey: ***************</Typography>;
  }
  const handleCopy = async () => {
    window.navigator.clipboard.writeText(apikey);
    toast("copied");
  };
  return (
    <Tooltip title="click to copy">
      <Typography
        onClick={handleCopy}
        level="body2"
        sx={(theme) => ({
          ":hover": {
            background: "#eee",
          },
        })}
      >
        apikey: {apikey}
      </Typography>
    </Tooltip>
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
      查看 Apikey
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
