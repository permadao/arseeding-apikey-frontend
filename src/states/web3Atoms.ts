import { ethers, providers } from "ethers";
import { sleep } from "../tools";
import { atom } from "jotai";
import detectEthereumProvider from "@metamask/detect-provider";
import { CannotFindMetamaskWalletError } from "../errors";

export const providerAtom = atom(async (get) => {
  const metamaskProvider = await get(metamaskProviderAtom);
  const provider = new ethers.providers.Web3Provider(metamaskProvider);
  return provider;
});

export const signerAtom = atom(async (get) => {
  const provider = await get(providerAtom);
  return provider.getSigner();
});

export const metamaskProviderAtom = atom(async () => {
  // MOCK delay
  await sleep(1000);
  const p: providers.ExternalProvider | null = await detectEthereumProvider({
    mustBeMetaMask: false,
  });
  if (!p) {
    throw new CannotFindMetamaskWalletError("can not find metamask wallet");
  }
  return p;
});

export type ConnectWalletFnType = {
  provider: ethers.providers.Web3Provider;
};
export const connectWalletFnV2Atom = atom(
  null,
  async (get, _set, value: ConnectWalletFnType) => {
    const provider = value.provider;
    const accounts = (await provider.send(
      "eth_requestAccounts",
      []
    )) as string[];

    return accounts;
  }
);
