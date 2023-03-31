import { useAtom } from "jotai";
import { accountAtom, loadableConnectWalletFnAtom } from "../states";
import Button from "@mui/joy/Button";
import { useState } from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/joy/Alert";
import Typography from "@mui/joy/Typography";
import WarningIcon from "@mui/icons-material/Warning";

export function ConnectWallet() {
  const [, setAccount] = useAtom(accountAtom);
  const [connectWalletFn] = useAtom(loadableConnectWalletFnAtom);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGetAccounts = async () => {
    if (connectWalletFn.state === "hasData") {
      const accounts = await connectWalletFn.data();
      setAccount(accounts[0]);
    }
    if (connectWalletFn.state === "hasError") {
      const error = connectWalletFn.error as Error;
      console.error({ error });
      setErrorMessage(error.message ?? (error as object).toString());
    }
  };
  return (
    <Box>
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
      <Button
        loading={connectWalletFn.state === "loading"}
        onClick={handleGetAccounts}
      >
        CONNECT WALLET
      </Button>
    </Box>
  );
}
