import { atom, useAtom } from "jotai";
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
import fetchStatusFn from "../api/fetch-status";
import { loadable } from "jotai/utils";
import {
  TagCannotBeNullError,
  AmountInvalidError,
  CannotFindMetamaskWalletError,
} from "../errors";
import { sleep } from "../tools";
import { topupTagAtom, topupAmountAtom, accountAtom } from "./primitiveAtoms";
import { OrderKey } from "../types";
import { fetchBundlerAddress, getApikey } from "../api";
export * from "./primitiveAtoms";

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
  queryFn: fetchBundlerAddress,
  retry: true,
  retryDelay: 2000,
}));

export const metamaskProviderAtom = atom(
  async () => {
    // MOCK delay
    await sleep(1000);
    const p: providers.ExternalProvider | null = await detectEthereumProvider({
      mustBeMetaMask: false,
    });
    if (!p) {
      throw new CannotFindMetamaskWalletError("can not find metamask wallet");
    }
    return p;
  }
  // (get, set, newValue) => {
  //   console.error({
  //     m: "set metamask provider atom",
  //     newValue,
  //   });
  // }
);

export const providerAtom = atom(async (get) => {
  const metamaskProvider = await get(metamaskProviderAtom);
  const provider = new ethers.providers.Web3Provider(metamaskProvider);
  return provider;
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
    const orderKey: OrderKey<typeof balances> = ["balance", "symbol"];
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
    const res = await getApikey(curTime, signature);

    // report error here.
    if (isString(res)) {
      return res;
    }
    throw new Error(res.error);
  };
});

export const topupToApikeyAtom = atom(async (get) => {
  const tag = get(topupTagAtom);
  const amount = get(topupAmountAtom);
  const everpay = await get(everpayAtom);
  const arseedingBundlerAddress = await get(arseedBundlerAddressAtom);
  // MOCK delay for test
  await sleep(1000);

  return async () => {
    if (!tag) {
      return Promise.reject(new TagCannotBeNullError("tag can not be null"));
    }
    if (!amount || amount <= 0) {
      return Promise.reject(new AmountInvalidError("amount error"));
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
  const provider = await get(providerAtom);
  return async () =>
    (await provider.send("eth_requestAccounts", [])) as string[];
});
export const loadableConnectWalletFnAtom = loadable(connectWalletFnAtom);
export const loadableTopupToApikeyAtom = loadable(topupToApikeyAtom);
