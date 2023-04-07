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
import { TokenItem } from "../api";
import { ethers } from "ethers";
import { useTranslation } from "react-i18next";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItem from "@mui/material/ListItem";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import KeyIcon from "@mui/icons-material/Key";

export function ApikeyStatus() {
  const [apikeyStatus] = useAtom(apikeyStatusAtom);
  const { t } = useTranslation();

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
        <Typography>
          {t("Topup to register current address a apikey.")}
        </Typography>
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
        <Typography
          level="h4"
          sx={(theme) => ({
            fontSize: theme.fontSize.xl,
            fontWeight: theme.fontWeight.xl,
            mb: 0.5,
          })}
        >
          {t("Apikey Status")}
        </Typography>

        <List component="div" disablePadding={false} dense>
          <ApikeyContainer />
          <CapText bytes={apikeyStatus.estimateCap} />
          <TokenBalanceView tokenBalance={apikeyStatus.tokens} />
        </List>

        <Suspense fallback="loading get apikey button">
          <GetApikeyButton />
        </Suspense>
      </Box>
    </Container>
  );
}

function ApikeyContainer() {
  const { t } = useTranslation();
  const [apikey] = useAtom(apikeyAtom);

  if (!apikey) {
    return (
      <ListItem>
        <ListItemText
          primary={<Typography>apikey: ***************</Typography>}
        />
      </ListItem>
    );
  }
  const handleCopy = async () => {
    window.navigator.clipboard.writeText(apikey);
    toast(t("copied"));
  };
  return (
    <ListItemButton onClick={handleCopy}>
      <ListItemText primary={<Typography>apikey: {apikey}</Typography>} />
    </ListItemButton>
  );
}

function GetApikeyButton() {
  const { t } = useTranslation();

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
      {t("View Apikey")}
    </Button>
  );
}

function CapText({ bytes }: { bytes: string }) {
  const { t } = useTranslation();

  const cap = useMemo(() => {
    return formatBytes(Number(bytes));
  }, [bytes]);
  return (
    <ListItem>
      <ListItemText
        primary={
          <Typography>
            {t("Estimate cap:")}
            {cap}
          </Typography>
        }
      />
    </ListItem>
  );
}

function TokenBalanceView({
  tokenBalance,
}: {
  tokenBalance: {
    [tokenTag: string]: TokenItem;
  };
}) {
  const { t } = useTranslation();
  const [isExpand, setExpand] = useState(false);

  const balancesItem = useMemo(
    () =>
      Object.keys(tokenBalance).map((o) => {
        const { symbol, balance, decimals } = tokenBalance[o];
        const balanceText = ethers.utils.formatUnits(balance, decimals);
        return (
          <ListItem key={o}>
            <ListItemText
              primary={
                <Box sx={{ display: "flex" }}>
                  <Typography sx={{ flexGrow: 1 }}>{symbol}:</Typography>
                  <Typography>{balanceText}</Typography>
                </Box>
              }
            />
          </ListItem>
        );
      }),
    [tokenBalance]
  );
  const handleExpand = () => {
    setExpand(!isExpand);
  };

  return (
    <>
      <ListItemButton onClick={handleExpand}>
        <ListItemText
          primary={
            <Typography>{t("Token balances in this apikey")}</Typography>
          }
        />
        {isExpand ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>

      <Collapse in={isExpand} unmountOnExit>
        <List component="div" disablePadding>
          {balancesItem}
        </List>
      </Collapse>
    </>
  );
}
