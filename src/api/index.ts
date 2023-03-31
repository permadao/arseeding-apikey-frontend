import { sleep } from "../tools";

export * from "./fetch-status";
export const fetchBundlerAddress = async () => {
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
