import { atom } from "jotai";
import BigNumber from "bignumber.js";

export const topupStoringSizeAtom = atom<number>(1073741824);
export const topupTokenSymbolAtom = atom<string | null>(null);
export const topupTagAtom = atom<string | null>(null);
export const topupAmountAtom = atom<BigNumber>(BigNumber(0));
export const accountAtom = atom<string | null>(null);
export const apikeyAtom = atom<string | null>(null);
