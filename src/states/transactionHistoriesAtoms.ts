import { atomsWithInfiniteQuery } from "jotai-tanstack-query";
import { accountAtom } from ".";
import { atom } from "jotai";

const numAtom = atom(10);

type History = {
  rawId: string;
  everHash: string;
  timestamp: number;
  symbol: string;
  amount: string;
  decimals: string;
};

type HistoryPage = Array<History>;

export const [historiesAtom] = atomsWithInfiniteQuery((get) => {
  const account = get(accountAtom);
  const num = get(numAtom);
  return {
    queryKey: ["transaction-histories", account],
    queryFn: async ({ pageParam, queryKey, signal, meta }) => {
      const rawId = pageParam as string;

      const params = () => {
        if (rawId) {
          return new URLSearchParams({
            rawId,
            num: num.toString(),
          });
        }
        return new URLSearchParams({
          num: num.toString(),
        });
      };
      if (!account) {
        throw new Error("account can not be null");
      }

      const url = `https://arseed.web3infra.dev/apikey_records/deposit/${account}?${params().toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      return data as unknown as HistoryPage;
    },
    getNextPageParam: (lastPage: HistoryPage, pages): string | undefined => {
      if (lastPage.length < num) return undefined;
      return lastPage.at(-1)?.rawId;
    },
    refetchInterval: 5000,
  };
});
