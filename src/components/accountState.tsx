import { useAtom } from "jotai";
import { accountAtom, metamaskProviderAtom } from "../states";
import Button from "@mui/joy/Button";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { loadable } from "jotai/utils";

const loadableMetamaskProviderAtom = loadable(metamaskProviderAtom);

export function AccountState() {
  const { t } = useTranslation();
  const [metamaskProvider] = useAtom(loadableMetamaskProviderAtom);
  const [account, setAccount] = useAtom(accountAtom);

  useEffect(() => {
    if (metamaskProvider.state === "hasData") {
      const provider = metamaskProvider.data as {
        on: any;
        removeListener: any;
      };
      const handleAccountsChanged = (accounts: string[]) => {
        setAccount(accounts.length === 0 ? null : accounts[0]);
      };
      provider.on("accountsChanged", handleAccountsChanged);

      return () => {
        provider.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, [metamaskProvider]);

  const isLoading = useMemo(
    () => typeof account !== "string" || metamaskProvider.state === "loading",
    [account, metamaskProvider.state]
  );

  const accountText = useMemo(() => {
    if (isLoading) return t("Wallet Connected");
    const a = account?.substring(0, 10);
    return a ? `${a}...` : "";
  }, [account, isLoading]);

  const handleClick = () => {
    // setMetamaskProviderAtom("hahaha");
  };
  return (
    <Button
      loading={isLoading}
      onClick={handleClick}
      sx={(theme) => ({
        marginLeft: theme.spacing(2),
      })}
    >
      {accountText}
    </Button>
  );
}
