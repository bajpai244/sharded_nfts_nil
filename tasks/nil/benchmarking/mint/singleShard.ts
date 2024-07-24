import { task } from "hardhat/config";
import {
  PublicClient,
  HttpTransport,
  LocalECDSAKeySigner,
  type Hex,
  WalletV1,
  waitTillCompleted,
} from "@nilfoundation/niljs";
// import { PublicClient, HttpTransport, LocalECDSAKeySigner, type Hex, WalletV1, waitTillCompleted } from "../../nil.js"
import { config } from "dotenv";
import { getBenchmarkConfig, getEnv } from "../../../../utils";

config();

task(
  "benchmark-mint-shard-size-1",
  "benchmark mints on single shard",
).setAction(async (taskArgs, hre) => {
  const ShardId = 0;

  const config = getBenchmarkConfig("./benchmark.config.json");
  console.log("config:", config);
});
