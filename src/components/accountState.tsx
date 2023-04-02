import { useAtom } from "jotai";
import { accountAtom, metamaskProviderAtom } from "../states";
import Button from "@mui/joy/Button";
import { useEffect } from "react";

export function AccountState() {
  const [metamaskProvider] = useAtom(metamaskProviderAtom);
  const [account, setAccount] = useAtom(accountAtom);

  useEffect(() => {
    const provider = metamaskProvider as { on: any; removeListener: any };
    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts.length === 0 ? null : accounts[0]);
    };
    provider.on("accountsChanged", handleAccountsChanged);

    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [metamaskProvider]);

  const handleClick = () => {
    // setMetamaskProviderAtom("hahaha");
  };
  return (
    <Button loading={typeof account !== "string"} onClick={handleClick}>
      Wallet Connected
    </Button>
  );
}
