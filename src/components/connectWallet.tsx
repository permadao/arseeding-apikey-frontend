import { atom, useAtom } from "jotai";
import { accountAtom, connectWalletFnV2Atom, providerAtom } from "../states";
import Button from "@mui/joy/Button";
import { Suspense } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Alert from "@mui/joy/Alert";
import Typography from "@mui/joy/Typography";
import WarningIcon from "@mui/icons-material/Warning";
import { CircularProgress } from "@mui/joy";
import { useTranslation } from "react-i18next";

const errorMessageAtom = atom<string | null>(null);

export function UnconnectView() {
  const [errorMessage] = useAtom(errorMessageAtom);
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
        {errorMessage && (
          <Alert startDecorator={<WarningIcon />} color="danger" variant="soft">
            <div>
              <Typography fontWeight="lg" mt={0.25}>
                Error
              </Typography>
              <Typography fontSize="sm" sx={{ opacity: 0.8 }}>
                {errorMessage}
              </Typography>
            </div>
          </Alert>
        )}
        <Suspense fallback={<CircularProgress variant="solid" />}>
          <ConnectWalletBtn />
        </Suspense>
      </Container>
    </Container>
  );
}

function ConnectWalletBtn() {
  const { t } = useTranslation();
  const [, setAccount] = useAtom(accountAtom);
  const [, setErrorMessage] = useAtom(errorMessageAtom);

  const [provider] = useAtom(providerAtom);
  const [, connectWalletFnV2] = useAtom(connectWalletFnV2Atom);
  const handleGetAccounts = async () => {
    try {
      const accounts = await connectWalletFnV2({ provider });
      if (accounts.length < 1) {
        throw new Error("accounts length can not less than 1.");
      }
      setAccount(accounts[0]);
    } catch (e) {
      const error = e as unknown as Error;
      console.error({ error });
      setErrorMessage(error.message ?? (error as object).toString());
    }
  };

  return <Button onClick={handleGetAccounts}>{t("CONNECT WALLET")}</Button>;
}
