import { atomsWithInfiniteQuery } from "jotai-tanstack-query";
import { accountAtom, numAtom } from ".";
import { atom } from "jotai";

type History = {
  rawId: string;
  everHash: string;
  timestamp: number;
  symbol: string;
  amount: string;
  decimals: string;
};

type HistoryPage = Array<History>;

export const [historiesAtom] = atomsWithInfiniteQuery<
  HistoryPage,
  string,
  HistoryPage,
  HistoryPage,
  (string | null)[]
>((get) => {
  const account = get(accountAtom);
  const num = get(numAtom);
  return {
    queryKey: ["transaction-histories", account],
    queryFn: ({ pageParam }) => fetchHistories(pageParam, num, account),
    getNextPageParam: (lastPage: HistoryPage, pages): string | undefined => {
      if (lastPage.length < num) return undefined;

      return lastPage.at(-1)?.rawId;
    },
    refetchInterval: 5000,
  };
});

async function fetchHistories(
  rawId: string | undefined,
  num: number,
  account: string | null
) {
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
}
