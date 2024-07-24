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
  const shardId = 1;

  const { BENCHMARK_CONFIG_FILE_PATH } = EnvSchema.pick({
    BENCHMARK_CONFIG_FILE_PATH: true,
  }).parse(process.env);

  const config = getBenchmarkConfig(BENCHMARK_CONFIG_FILE_PATH);
  const { deployerInfo } = config.ShardsInfo[shardId];

  const client = new PublicClient({
    transport: new HttpTransport({
      endpoint: config.NilRpcEndpoint,
    }),
    shardId,
  });

  const signer = new LocalECDSAKeySigner({
    privateKey: deployerInfo.privateKey as Hex,
  });

  const pubKey = await signer.getPublicKey();

  const wallet = new WalletV1({
    pubkey: pubKey,
    client,
    signer,
    address: deployerInfo.walletAddress as Hex,
  });

  const walletAddress = wallet.getAddressHex();
  console.log("wallet address: ", walletAddress);

  const artifact = await hre.artifacts.readArtifact("ShardedNFT");
  const abi = artifact.abi;
  const bytecode = artifact.bytecode as Hex;

  const { address, hash } = await wallet.deployContract({
    bytecode,
    abi,
    salt: BigInt(Math.floor(Math.random() * 10000)),
    shardId,
    args: [shardId, 1, 100],
    gas: 200000n,
    value: 5000000n,
  });

  await waitTillCompleted(client, 1, hash);

  console.log("Contract deployed at address: ", address);
  console.log("Transaction hash: ", hash);
});
