import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import type { NilHardhatUserConfig } from "@nilfoundation/hardhat-plugin";
import "@nilfoundation/hardhat-plugin";

// Import tasks
import "./tasks/nil/deployShardedNFT";
import "./tasks/local/deployShardedNFTLocal";
import "./tasks/nil/mintShardedNFT";
import "./tasks/local/mintShardedNFTLocal";

import "./tasks/nil/deployAndfundWallet";

import "./tasks/nil/benchmarking/mint/singleShard";
import "./tasks/nil/benchmarking/createAccounts";
import "./tasks/nil/deployAndfundWallets";

dotenv.config();

const config: NilHardhatUserConfig = {
  solidity: "0.8.24",
  ignition: {
    requiredConfirmations: 1,
  },
  networks: {
    nil: {
      url: process.env.NIL_RPC_ENDPOINT,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  walletAddress: process.env.WALLET_ADDR,
  shardId: 1,
};
export default config;
