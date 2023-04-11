import { atom, useAtom } from "jotai";
import { accountAtom, connectWalletFnV2Atom, providerAtom } from "../states";
import Button from "@mui/joy/Button";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Alert from "@mui/joy/Alert";
import Typography from "@mui/joy/Typography";
import WarningIcon from "@mui/icons-material/Warning";
import { useTranslation } from "react-i18next";
import { loadable } from "jotai/utils";
import walletSvg from "../assets/wallet.svg";

const errorMessageAtom = atom<string | null>(null);
const loadableProviderAtom = loadable(providerAtom);

export function UnconnectView() {
  const { t } = useTranslation();
  const [, setAccount] = useAtom(accountAtom);
  const [errorMessage, setErrorMessage] = useAtom(errorMessageAtom);
  const [provider] = useAtom(loadableProviderAtom);
  const [, connectWalletFnV2] = useAtom(connectWalletFnV2Atom);

  if (provider.state === "hasError") {
    console.error({ provider });
    setErrorMessage(provider.error as string);
  }
  const handleGetAccounts = async () => {
    if (provider.state === "hasData") {
      try {
        const accounts = await connectWalletFnV2({ provider: provider.data });
        if (accounts.length < 1) {
          throw new Error("accounts length can not less than 1.");
        }
        setAccount(accounts[0]);
      } catch (e) {
        const error = e as unknown as Error;
        console.error({ error });
        setErrorMessage(error.message ?? (error as object).toString());
      }
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={(theme) => ({
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItem: "center",
      })}
    >
      <Container
        sx={(theme) => ({
          marginTop: theme.spacing(2),
          background: theme.palette.background.paper,
          height: "509px",
          display: "flex",
          justifyContent: "center",
          alignItem: "center",
          flexDirection: "column",
          padding: theme.spacing(4),
          gap: theme.spacing(3),
          boxShadow: theme.shadows[1],
          borderRadius: theme.shape.borderRadius,
        })}
      >
        <img src={walletSvg} alt="wallet logo png" />
        <Typography
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            fontSize: theme.fontSize.sm,
            textAlign: "center",
          })}
        >
          {t("Connect Wallet to Adopt Arseeding Apikey")}
        </Typography>
        {errorMessage && <AlertView errorMessage={errorMessage} />}
        <Button
          loading={provider.state === "loading"}
          loadingPosition="end"
          onClick={handleGetAccounts}
        >
          {t("CONNECT WALLET")}
        </Button>
      </Container>
    </Container>
  );
}

function AlertView({ errorMessage }: { errorMessage: string }) {
  return (
    <Alert startDecorator={<WarningIcon />} color="danger" variant="soft">
      <Box>
        <Typography fontWeight="lg" mt={0.25}>
          Error
        </Typography>
        <Typography fontSize="sm" sx={{ opacity: 0.8 }}>
          {errorMessage}
        </Typography>
      </Box>
    </Alert>
  );
}
