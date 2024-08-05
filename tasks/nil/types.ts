import type { Hex } from "@nilfoundation/niljs";

export type WalletDeployments = {
  [key in `shard${number}`]: {
    address: Hex;
  };
};

export type ContractDeployments = {
  [key in `shard${number}`]: {
    address: Hex;
    transactionHash: Hex;
  };
};
