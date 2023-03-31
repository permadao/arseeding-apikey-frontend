import { atom, useAtom } from "jotai";
import { accountAtom, metamaskProviderAtom, providerAtom } from "../states";

export const onDisconnectAtom = atom(async (get) => {
  const [, setAccount] = useAtom(accountAtom);
  const metamaskProvider = await get(metamaskProviderAtom);
  // metamaskProvider.
  const provider = await get(providerAtom);
  provider.on("disconnect", (error) => {
    console.error({
      d: "onDisconnect",
      error,
    });
    setAccount(null);
  });
});

export const accountsChangedAtom = atom(async (get) => {
  const [, setAccount] = useAtom(accountAtom);
  const provider = await get(providerAtom);
  console.error({
    m: "accountchanged",
  });
  provider.on("accountsChanged", (accounts: string[]) => {
    console.error({ accounts });
    if (accounts.length < 1) {
      return;
    }
    setAccount(accounts[0]);
  });
});
