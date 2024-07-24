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
import { EnvSchema } from "../../../../utils/zod";

config();

task(
  "benchmark-mint-shard-size-1",
  "benchmark mints on single shard",
).setAction(async (taskArgs, hre) => {
  const ShardId = 0;

  const { BENCHMARK_CONFIG_FILE_PATH } = EnvSchema.pick({
    BENCHMARK_CONFIG_FILE_PATH: true,
  }).parse(process.env);

  const config = getBenchmarkConfig(BENCHMARK_CONFIG_FILE_PATH);
  console.log("config:", config);
});
