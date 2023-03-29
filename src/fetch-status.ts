export type StatusType = {
  estimateCap: string;
  tokenBalance: Record<string, string>;
} & {
  error?: string;
};

export default async function ({
  queryKey,
}: {
  queryKey: (string | string[])[];
}) {
  console.error("fetch data");
  const address = (queryKey[1] as Array<string>)[0];
  if (!address) throw new Error("address can not be error");
  const res = await fetch(
    `https://arseed.web3infura.io/apikey_info/${address}`
  );
  return (await res.json()) as StatusType;
}
