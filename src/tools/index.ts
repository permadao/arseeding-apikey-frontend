import { ethers } from "ethers";

export const sleep = (t: number) => {
  const mode = import.meta.env.MODE;
  if (mode === "development") {
    return new Promise((resolve) => setTimeout(resolve, t));
  }
  if (mode === "production") {
    return Promise.resolve();
  }
};

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`;
}

export function formatUnits(
  value: ethers.BigNumberish,
  decimals: string | ethers.BigNumberish = 0,
  maxDecimalDigits?: number
) {
  return ethers.FixedNumber.from(ethers.utils.formatUnits(value, decimals))
    .round(maxDecimalDigits ?? ethers.BigNumber.from(decimals).toNumber())
    .toString();
}
