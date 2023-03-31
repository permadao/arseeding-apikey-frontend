import { sleep } from "../tools";

export * from "./fetch-status";
export const fetchBundlerAddress = async () => {
  await sleep(2000);
  const res = await fetch(`https://arseed.web3infra.dev/bundle/bundler`);
  const data: { bundler: string } = await res.json();
  return data.bundler;
};
