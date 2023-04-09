import { atomsWithQuery } from "jotai-tanstack-query";
import { ethers } from "ethers";
import {
  ACCOUNT_STATUS_QUERY_KEY,
  ARSEEDING_BUNDLER_ADDRESS,
  STORING_FEE_KEY,
} from "../constants";
import { loadable } from "jotai/utils";
import { TagCannotBeNullError, AmountInvalidError } from "../errors";
import { sleep } from "../tools";
import {
  topupTagAtom,
  topupAmountAtom,
  accountAtom,
  topupTokenSymbolAtom,
  topupStoringSizeAtom,
  storingCostEstimateSizeBaseAtom,
} from "./primitiveAtoms";
import {
  fetchApikeyStatusFn,
  fetchBundlerAddress,
  getApikey,
  getStoringFee,
} from "../api";
import { signerAtom } from "./web3Atoms";
import { everpayAtom } from "./everpayAtoms";
import { atom } from "jotai";

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
