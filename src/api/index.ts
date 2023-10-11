import { CurrencyOrSizeInvalidError, QueryKeyLengthError } from "../errors";
import { sleep } from "../tools";

export const fetchBundlerAddress = async () => {
  // MOCK delay
  await sleep(2000);
  const res = await fetch(`https://arseed.web3infra.dev/bundle/bundler`);
  const data: { bundler: string } = await res.json();
  return data.bundler;
};

export type GetApikeyRep = string | { error: string };

export const getApikey = async (curTime: number, signature: string) => {
  const res = await fetch(
    `https://arseed.web3infra.dev/apikey/${curTime}/${signature}`
  );
  const data = (await res.json()) as unknown as GetApikeyRep;

  return data;
};

export type TokenItem = {
  balance: string;
  decimals: number;
  symbol: string;
};
export type ApikeyStatusType =
  | {
      estimateCap: string;
      tokens: {
        [tokenTag: string]: TokenItem;
      };
    }
  | {
      error: string;
    };

export async function fetchApikeyStatusFn({
  queryKey,
}: {
  queryKey: (string | null)[];
}) {
  const address = queryKey[1];
  if (!address) throw new Error("address can not be null");
  const res = await fetch(
    `https://arseed.web3infra.dev/apikey_info/${address}`
  );
  const data = (await res.json()) as ApikeyStatusType;
  return data;
}

export type GetStoringFeeRep =
  | {
      currency: string;
      decimals: number;
      finalFee: string;
    }
  | {
      error: string;
    };

// https://web3infra.dev/zh-cn/docs/arseeding/sdk/arseeding-js/bundle#%E6%9F%A5%E8%AF%A2-bundle-item-%E5%AD%98%E5%82%A8%E8%B4%B9%E7%94%A8
// https://web3infra.dev/zh-cn/docs/arseeding/api/bundle#get-bundle-fee
export const getStoringFee = async ({
  queryKey,
}: {
  queryKey: (string | number | null)[];
}) => {
  if (queryKey.length !== 3) {
    throw new QueryKeyLengthError("length of queryKey must be 2.");
  }
  const currency = queryKey[1];
  const size = queryKey[2];

  if (!currency || !size) {
    throw new CurrencyOrSizeInvalidError(
      `currency or size error: currency: ${currency}, size: ${size}`
    );
  }
  // MOCK delay
  await sleep(1000);
  const res = await fetch(
    `https://arseed.web3infra.dev/bundle/fee/${size}/${currency}`
  );

  // TODO: safely cast object here
  const data = (await res.json()) as unknown as GetStoringFeeRep;

  return data;
};
