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

export const BaseError = class extends Error {
  constructor(message: string) {
    super(message);
  }
};

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export const accountAtom = atom<string | null>(null);

// get bundler address here:
// https://arseed.web3infra.dev/bundle/bundler
export const [statusAtom] = atomsWithQuery((get) => ({
  queryKey: [ACCOUNT_STATUS_QUERY_KEY, get(accountAtom)],
  queryFn: fetchStatusFn,
  refetchInterval: 2000,
  retry: true,
  retryDelay: 2000,
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
  retry: true,
  retryDelay: 2000,
}));
export const CannotFindMetamaskWalletError = class extends BaseError {};
export const metamaskProviderAtom = atom(async () => {
  // MOCK delay
  await sleep(1000);
  const p: providers.ExternalProvider | null = await detectEthereumProvider({
    mustBeMetaMask: true,
  });
  if (!p) {
    throw new CannotFindMetamaskWalletError("can not find metamask wallet");
  }
  return p;
});

export const providerAtom = atom(async (get) => {
  const metamaskProvider = await get(metamaskProviderAtom);
  return new ethers.providers.Web3Provider(metamaskProvider);
});
export const signerAtom = atom(async (get) => {
  const provider = await get(providerAtom);
  return provider.getSigner();
});

export const everpayAtom = atom(async (get) => {
  // TODO: supporting select account.
  // TODO: check lenght
  const account = get(accountAtom);
  if (!account) {
    throw new Error("account not found");
  }
  const signer = await get(signerAtom);
  const everpay = new Everpay({
    account: account,
    chainType: ChainType.ethereum,
    ethConnectedSigner: signer,
  });

  return everpay;
});
const sleep = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

export const tokensInfoAtom = atom(async (get) => {
  // MOCK: delay
  await sleep(1000);
  const everpay = await get(everpayAtom);
  const res = await everpay.info();

  return res;
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
    return orderBy(balances, orderKey, orderPat).filter(
      (e) => e.balance !== "0"
    );
  },
  refetchInterval: 2000,
  retry: true,
  retryDelay: 2000,
}));

export const getApikeyAtom = atom(async (get) => {
  const signer = await get(signerAtom);
  return async () => {
    // https://www.notion.so/permadao/123-3b62f09dcc2c4076886f40fdf7252e1d
    const curTime = ~~(new Date().getTime() / 1000);
    const signature = await signer.signMessage(curTime.toString());

    const rep = await fetch(
      `https://arseed.web3infra.dev/apikey/${curTime}/${signature}`
    );
    const res = (await rep.json()) as unknown as
      | string
      | {
          error: string;
        };

    // report error here.
    if (isString(res)) {
      return res;
    }
    throw new Error(res.error);
  };
});

import { loadable } from "jotai/utils";

export const topupTokenSymbolAtom = atom<string | null>(null);
export const topupTagAtom = atom<string | null>(null);
export const topupAmountAtom = atom<number>(0);
export const topupToApikeyAtom = atom(async (get) => {
  const tag = get(topupTagAtom);
  const amount = get(topupAmountAtom);
  const everpay = await get(everpayAtom);
  const arseedingBundlerAddress = await get(arseedBundlerAddressAtom);
  // MOCK delay for test
  await sleep(500);

  return async () => {
    if (!tag) {
      return new TagCannotBeNullError("tag can not be null");
    }
    if (!amount || amount <= 0) {
      return new AmountInvalidError("amount error");
    }
    return await everpay.transfer({
      tag,
      amount: amount.toString(),
      to: arseedingBundlerAddress,
      data: { appName: "arseeding", action: "apikeyPayment" },
    });
  };
});
export const connectWalletFnAtom = atom(async (get) => {
  const metamaskProvider = await get(metamaskProviderAtom);
  return async () => {
    return (await metamaskProvider.request!({
      method: "eth_requestAccounts",
    })) as string[];
  };
});
export const loadableConnectWalletFnAtom = loadable(connectWalletFnAtom);
export const loadableTopupToApikeyAtom = loadable(topupToApikeyAtom);

export const AmountInvalidError = class extends BaseError {};
export const TagCannotBeNullError = class extends BaseError {};
