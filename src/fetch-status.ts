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
  //   const address = "0x4002ED1a1410aF1b4930cF6c479ae373dEbD6223";
  const res = await fetch(
    `https://arseed.web3infura.io/apikey_info/${address}`
  );
  return (await res.json()) as StatusType;
}
