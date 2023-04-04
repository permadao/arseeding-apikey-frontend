import { atom } from "jotai";
import { atomsWithQuery } from "jotai-tanstack-query";
import Everpay, { ChainType } from "everpay";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers, providers } from "ethers";
import { orderBy } from "lodash";
import {
  ACCOUNT_STATUS_QUERY_KEY,
  ARSEEDING_BUNDLER_ADDRESS,
  BALANCES_KEY,
  STORING_FEE_KEY,
} from "../constants";
import { loadable } from "jotai/utils";
import {
  TagCannotBeNullError,
  AmountInvalidError,
  CannotFindMetamaskWalletError,
  AcountNotFoundError,
} from "../errors";
import { sleep } from "../tools";
import {
  topupTagAtom,
  topupAmountAtom,
  accountAtom,
  topupTokenSymbolAtom,
  topupStoringSizeAtom,
  storingCostEstimateSizeBaseAtom,
} from "./primitiveAtoms";
import { OrderKey } from "../types";
import {
  fetchApikeyStatusFn,
  fetchBundlerAddress,
  getApikey,
  getStoringFee,
} from "../api";
import BigNumber from "bignumber.js";
export * from "./primitiveAtoms";

// get bundler address here:
// https://arseed.web3infra.dev/bundle/bundler
export const [apikeyStatusAtom] = atomsWithQuery((get) => ({
  queryKey: [ACCOUNT_STATUS_QUERY_KEY, get(accountAtom)],
  queryFn: fetchApikeyStatusFn,
  refetchInterval: 2000,
  retry: true,
  retryDelay: 2000,
}));

export const [arseedingBundlerAddressAtom] = atomsWithQuery(() => ({
  queryKey: [ARSEEDING_BUNDLER_ADDRESS],
  queryFn: fetchBundlerAddress,
  retry: true,
  retryDelay: 2000,
}));

export const [fetchStoringFeeAtom] = atomsWithQuery((get) => {
  const currencySymbol = get(topupTokenSymbolAtom);
  const storingSize = get(topupStoringSizeAtom);

  return {
    queryKey: [STORING_FEE_KEY, currencySymbol, storingSize],
    queryFn: getStoringFee,
    refetchInterval: 5000,
    retry: true,
    retryDelay: 2000,
  };
});
export const loadableFetchStoringFeeAtom = loadable(fetchStoringFeeAtom);
// hack: estimate storing cost in usd (actually we fetch the storing cost of USDC)...
export const [fetchStoringCostInUSDCAtom] = atomsWithQuery((get) => {
  const sizeBase = get(storingCostEstimateSizeBaseAtom);
  return {
    queryKey: [STORING_FEE_KEY, "USDC", sizeBase],
    queryFn: getStoringFee,
    refetchInterval: 5000,
    retry: true,
    retryDelay: 2000,
  };
});
export const extractCostInUSDAtom = atom(async (get) => {
  const fecther = await get(fetchStoringCostInUSDCAtom);
  if ("error" in fecther) {
    return "NaN";
  }
  return ethers.utils.formatUnits(fecther.finalFee, fecther.decimals);
});
export const loadableFetchStoringCostInUSDCAtom = loadable(
  fetchStoringCostInUSDCAtom
);
export const loadableExtractCostInUSDAtom = loadable(extractCostInUSDAtom);

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
    throw new AcountNotFoundError("account not found");
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
    return balances;
  },
  refetchInterval: 2000,
  retry: true,
  retryDelay: 2000,
}));

export const sortedBalancesAtom = atom(async (get) => {
  const balances = await get(balancesAtom);
  const orderKey: OrderKey<typeof balances> = ["balance", "symbol"];
  const orderPat: Array<"desc" | "asc"> = ["desc", "asc"];
  return orderBy(balances, orderKey, orderPat);
});

export const notZeroBalancesAtom = atom(async (get) => {
  const balances = await get(sortedBalancesAtom);
  return balances.filter((e) => e.balance !== "0");
});

// export const getApikeyAtom = atom(async (get) => {
//   const signer = await get(signerAtom);
//   return async () => {
//     // https://www.notion.so/permadao/123-3b62f09dcc2c4076886f40fdf7252e1d
//     const curTime = ~~(new Date().getTime() / 1000);
//     const signature = await signer.signMessage(curTime.toString());
//     const res = await getApikey(curTime, signature);

//     // report error here.
//     if (typeof res === "string") {
//       return res;
//     }
//     throw new Error(res.error);
//   };
// });

export const getApikeyAtom = atom(
  () => null,
  async (get, _set, value: { signerAtom: typeof signerAtom }) => {
    const signer = await get(value.signerAtom);
    // https://www.notion.so/permadao/123-3b62f09dcc2c4076886f40fdf7252e1d
    const curTime = ~~(new Date().getTime() / 1000);
    const signature = await signer.signMessage(curTime.toString());
    const res = await getApikey(curTime, signature);
    // report error here.
    if (typeof res === "string") {
      return res;
    }
    throw new Error(res.error);
  }
);

export const loadableGetApikeyFnAtom = loadable(getApikeyAtom);

export type topupApikeyParams = {
  tagAtom: typeof topupTagAtom;
  amountAtom: typeof topupAmountAtom;
  everpayAtom: typeof everpayAtom;
  arseedingBundlerAddressAtom: typeof arseedingBundlerAddressAtom;
};
export const topupApikeyAtom = atom(
  // async () => null,
  null,
  async (get, _set, value: topupApikeyParams) => {
    const tag = get(value.tagAtom);
    const amount = get(value.amountAtom);
    const everpay = await get(value.everpayAtom);
    const arseedingBundlerAddress = await get(
      value.arseedingBundlerAddressAtom
    );
    // MOCK delay for test
    await sleep(1000);

    if (!tag) {
      return Promise.reject(new TagCannotBeNullError("tag can not be null"));
    }
    if (!amount || amount.lt(0)) {
      return Promise.reject(new AmountInvalidError("amount error"));
    }
    const data = { appName: "arseeding", action: "apikeyPayment" };
    const res = await everpay.transfer({
      tag,
      amount: amount.toString(),
      to: arseedingBundlerAddress,
      data,
    });

    return res;
  }
);

export const connectWalletFnAtom = atom(async (get) => {
  const provider = await get(providerAtom);
  return async () =>
    (await provider.send("eth_requestAccounts", [])) as string[];
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

export const loadableConnectWalletFnAtom = loadable(connectWalletFnAtom);
