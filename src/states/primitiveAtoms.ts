import { atom } from "jotai";
import BigNumber from "bignumber.js";

// 1GB
export const storingCostEstimateSizeBaseAtom = atom<number>(1073741824);

export const topupStoringSizeAtom = atom<number>(1073741824);
export const topupTokenSymbolAtom = atom<string | null>("AR");
export const topupTagAtom = atom<string | null>(
  "arweave,ethereum-ar-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0x4fadc7a98f2dc96510e42dd1a74141eeae0c1543"
);
export const topupAmountAtom = atom<BigNumber>(BigNumber(0));
export const accountAtom = atom<string | null>(null);
export const apikeyAtom = atom<string | null>(null);
