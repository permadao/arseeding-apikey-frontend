import { atom } from "jotai";

export const topupStoringSizeAtom = atom<number>(1073741824);
export const topupTokenSymbolAtom = atom<string | null>(null);
export const topupTagAtom = atom<string | null>(null);
export const topupAmountAtom = atom<number>(0);
export const accountAtom = atom<string | null>(null);
