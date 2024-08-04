import type { Hex } from "@nilfoundation/niljs";

export type WalletDeployments = {
  [key in `shard${number}`]: {
    address: Hex;
  };
};
