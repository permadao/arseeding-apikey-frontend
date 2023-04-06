import { atom, useAtom } from "jotai";
import { accountAtom, metamaskProviderAtom, providerAtom } from "../states";

export const onDisconnectAtom = atom(async (get) => {
  const [, setAccount] = useAtom(accountAtom);
  const provider = await get(providerAtom);
  provider.on("disconnect", (error) => {
    setAccount(null);
  });
});

export const accountsChangedAtom = atom(async (get) => {
  const [, setAccount] = useAtom(accountAtom);
  const provider = await get(providerAtom);
  provider.on("accountsChanged", (accounts: string[]) => {
    if (accounts.length < 1) {
      return;
    }
    setAccount(accounts[0]);
  });
});
