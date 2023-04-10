import { Suspense, useState } from "react";
import { accountAtom } from "./states";
import { useAtom } from "jotai";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import {
  ApikeyStatus,
  ArseedingBundlerStatus,
  BoxTitle,
  Topup,
  TransactionHistories,
} from "./components";
import CircularProgress from "@mui/joy/CircularProgress";
import { UnconnectView } from "./components/connectWallet";
import { MyAppBar } from "./components/appBar";
import Typography from "@mui/joy/Typography";
import { useTranslation } from "react-i18next";
import Skeleton from "@mui/material/Skeleton";

function App() {
  const [account] = useAtom(accountAtom);

  return (
    <Box
      display="grid"
      sx={{
        gridTemplateRows: "min-content 1fr min-content",
        minHeight: "100vh",
        background: "linear-gradient(90deg, #F3FFFC 0%, #FAF4FC 100%)",
      }}
    >
      <MyAppBar />
      {account ? <ConnectedView /> : <UnconnectView />}
      <Container maxWidth="lg">
        <Suspense
          fallback={
            <Skeleton>
              <Typography>
                arseeding bundler address:
                uDA8ZblC-lyEFfsYXKewpwaX-kkNDDw8az3IW9bDL68
              </Typography>
            </Skeleton>
          }
        >
          <ArseedingBundlerStatus />
        </Suspense>
      </Container>
    </Box>
  );
}

function ConnectedView() {
  return (
    <Box>
      <Suspense fallback={<CircularProgress variant="solid" />}>
        <ApikeyStatus />
      </Suspense>
      <Container
        sx={(theme) => ({ marginTop: theme.spacing(2) })}
        maxWidth="lg"
      >
        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
          <Start />
          <End />
        </Box>
      </Container>
    </Box>
  );
}

function Start() {
  const { t } = useTranslation();
  return (
    <Box
      sx={(theme) => ({
        padding: theme.spacing(3),
        background: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        height: "min-content",
      })}
      gridColumn={{ xs: "span 12", md: "span 6", lg: "span 6" }}
    >
      <BoxTitle title={t("Top up")} />
      <Topup />
    </Box>
  );
}

function End() {
  const { t } = useTranslation();
  const [hasPage, setHasPage] = useState<boolean>(false);

  return (
    <Box
      sx={(theme) => ({
        padding: theme.spacing(3),
        background: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        height: hasPage ? "min-content" : "inherit",
      })}
      gridColumn={{ xs: "span 12", md: "span 6", lg: "span 6" }}
    >
      <BoxTitle title={t("Transaction histories")} />
      <Suspense fallback={<CircularProgress />}>
        <TransactionHistories setHasPage={setHasPage} />
      </Suspense>
    </Box>
  );
}
export default App;
