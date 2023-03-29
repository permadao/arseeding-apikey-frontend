import { ethers } from "ethers";
import React from "react";
import Everpay, { ChainType } from "everpay";

export function useEverpay(signer: ethers.Signer, account: string) {
  return React.useMemo(() => {
    return new Everpay({
      account,
      chainType: ChainType.ethereum,
      ethConnectedSigner: signer,
    });
  }, [signer, account]);
}
