import { atom } from "jotai";
import Everpay, { ChainType } from "everpay";
import { accountAtom } from "./primitiveAtoms";
import { AcountNotFoundError } from "../errors";
import { signerAtom } from "./web3Atoms";
import { sleep } from "../tools";
import { atomsWithQuery } from "jotai-tanstack-query";
import { BALANCES_KEY } from "../constants";
import { OrderKey } from "../types";
import { orderBy } from "lodash";

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
