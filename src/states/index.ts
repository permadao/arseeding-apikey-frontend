import { atom, useAtom, Provider } from "jotai";
import { atomsWithQuery } from "jotai-tanstack-query";
import Everpay, { ChainType } from "everpay";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers, providers } from "ethers";
import { orderBy } from "lodash";
import isString from "is-string";

import {
  ACCOUNT_STATUS_QUERY_KEY,
  ARSEEDING_BUNDLER_ADDRESS,
  BALANCES_KEY,
} from "../constants";
import fetchStatusFn from "../fetch-status";

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export const accountsAtom = atom<string[]>([]);
export const arseedingBundlerAddressAtom = atom<string>(
  "uDA8ZblC-lyEFfsYXKewpwaX-kkNDDw8az3IW9bDL68"
);

// get bundler address here:
// https://arseed.web3infra.dev/bundle/bundler
export const [statusAtom] = atomsWithQuery((get) => ({
  queryKey: [ACCOUNT_STATUS_QUERY_KEY, get(accountsAtom)],
  queryFn: fetchStatusFn,
  refetchInterval: 2000,
  retry: true,
  retryDelay: 1000,
}));

export const [arseedBundlerAddressAtom] = atomsWithQuery(() => ({
  queryKey: [ARSEEDING_BUNDLER_ADDRESS],
  queryFn: async () => {
    const res = await fetch(`https://arseed.web3infra.dev/bundle/bundler`);
    return (
      (await res.json()) as {
        bundler: string;
      }
    ).bundler;
  },
}));

export const metamaskProviderAtom = atom(
  async (): Promise<providers.ExternalProvider> => {
    const p = await detectEthereumProvider({
      mustBeMetaMask: true,
    });
    if (!p) {
      throw new Error("can not find metamask");
    }
    return p;
  }
);
export const providerAtom = atom(async (get) => {
  const provider = new ethers.providers.Web3Provider(
    await get(metamaskProviderAtom)
  );
  return provider;
});
export const signerAtom = atom(async (get) => {
  const provider = await get(providerAtom);
  return provider.getSigner();
});
export const everpayAtom = atom(async (get) => {
  const accounts = get(accountsAtom);
  const signer = await get(signerAtom);
  const everpay = new Everpay({
    // TODO: supporting select account.
    // TODO: check lenght
    account: accounts[0],
    chainType: ChainType.ethereum,
    ethConnectedSigner: signer,
  });
  return everpay;
});

// get balances of current everpay account
export const [balancesAtom] = atomsWithQuery((get) => ({
  queryKey: [BALANCES_KEY],
  queryFn: async () => {
    const everpay = await get(everpayAtom);
    const balances = await everpay.balances();
    const orderKey: Array<keyof ArrayElement<typeof balances>> = [
      "balance",
      "symbol",
    ];
    const orderPat: Array<"desc" | "asc"> = ["desc", "asc"];
    return orderBy(balances, orderKey, orderPat);
  },
  refetchInterval: 2000,
  retry: 1000,
  retryDelay: 1000,
}));

export const getApikeyAtom = atom(async (get) => {
  const signer = await get(signerAtom);
  const accounts = get(accountsAtom);

  return async () => {
    // https://www.notion.so/permadao/123-3b62f09dcc2c4076886f40fdf7252e1d
    const curTime = ~~(new Date().getTime() / 1000);
    const signature = await signer.signMessage(curTime.toString());

    const rep = await fetch(
      `https://arseed.web3infra.dev/apikey/${accounts[0]}/${signature}`
    );
    const res = (await rep.json()) as unknown as
      | string
      | {
          error: string;
        };

    if (isString(res)) {
      return res;
    }
    throw new Error(res.error);
  };
});
