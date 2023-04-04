import { atom, useAtom } from "jotai";
import { accountAtom, connectWalletFnV2Atom, providerAtom } from "../states";
import Button from "@mui/joy/Button";
import { Suspense } from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/joy/Alert";
import Typography from "@mui/joy/Typography";
import WarningIcon from "@mui/icons-material/Warning";
import { CircularProgress } from "@mui/joy";

const errorMessageAtom = atom<string | null>(null);

export function UnconnectView() {
  const [errorMessage] = useAtom(errorMessageAtom);
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
      <Suspense fallback={<CircularProgress variant="solid" />}>
        <ConnectWalletBtn />
      </Suspense>
    </Box>
  );
}

function ConnectWalletBtn() {
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

  return <Button onClick={handleGetAccounts}>CONNECT WALLET</Button>;
}
