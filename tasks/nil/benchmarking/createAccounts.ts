import { task } from "hardhat/config";
import {
  PublicClient,
  HttpTransport,
  LocalECDSAKeySigner,
  type Hex,
  WalletV1,
  waitTillCompleted,
  Faucet,
} from "@nilfoundation/niljs";
// import { PublicClient, HttpTransport, LocalECDSAKeySigner, type Hex, WalletV1, waitTillCompleted } from "../../nil.js"
import { config } from "dotenv";
import { getBenchmarkConfig, getEnv, sleep } from "../../../utils";
import {
  AccountInfoSchema,
  EnvSchema,
  ShardInfoSchema,
} from "../../../utils/zod";
import { encodeFunctionData } from "viem";
import { readFileSync, writeFileSync } from "fs";
import { z } from "zod";

config();

task(
  "deploy_accounts_benchmarking",
  "deploys 25 accounts account for a shard, adds them to the benchmark.config.json file",
)
  .addParam<number>("shard", "The shard Id to deploy the wallets to")
  .setAction(async (taskArgs, hre) => {
    const { NIL_RPC_ENDPOINT, PRIVATE_KEY, BENCHMARK_CONFIG_FILE_PATH } =
      EnvSchema.omit({
        WALLET_ADDR: true,
      }).parse(process.env);

    const shardId = parseInt(taskArgs.shard);

    if (shardId < 1 || shardId > 3) {
      throw new Error("Shard Id should be between 1 and 3");
    }

    console.log("moving ahead for wallet deployment on shard : ", shardId);

    const client = new PublicClient({
      transport: new HttpTransport({
        endpoint: NIL_RPC_ENDPOINT,
      }),
      shardId,
    });

    const faucet = new Faucet(client);

    const signer = new LocalECDSAKeySigner({
      privateKey: PRIVATE_KEY as Hex,
    });

    const pubkey = await signer.getPublicKey();

    const walletsCollection: Array<z.infer<typeof AccountInfoSchema>> = [];

    for (let i = 0; i < 10; i++) {
      const wallet = new WalletV1({
        pubkey: pubkey,
        // TODO: extract to a util
        salt: BigInt(Math.floor(Math.random() * 100000000)),
        shardId,
        client,
        signer,
      });

      const walletAddress = wallet.getAddressHex();

      console.log("walletAddress:", walletAddress);

      // 0.1 Eth
      await faucet.withdrawToWithRetry(walletAddress, 100000000000000000n);

      await wallet.selfDeploy(true);

      walletsCollection.push({
        privateKey: PRIVATE_KEY,
        walletAddress,
      });
    }

    const benchmarkConfig = getBenchmarkConfig(BENCHMARK_CONFIG_FILE_PATH);
    benchmarkConfig.ShardsInfo[shardId].otherWalletsInfo.push(
      ...walletsCollection,
    );

    writeFileSync(
      BENCHMARK_CONFIG_FILE_PATH,
      JSON.stringify(benchmarkConfig, null, 2),
    );
    console.log(
      "wallets deployed successfully and written to benchmark.config.json",
    );
  });

const sendNftMintMessage = async (arg: {
  abi: any[];
  nftAddress: Hex;
  tokenId: number;
  wallet: WalletV1;
  seqNo: number;
}): Promise<Hex> => {
  const { abi, nftAddress, tokenId, wallet, seqNo } = arg;

  const mintTxnHash = await wallet.sendMessage({
    to: nftAddress,
    data: encodeFunctionData({
      abi,
      functionName: "mintTo",
      args: [wallet.getAddressHex().toLowerCase(), tokenId],
    }),
    gas: 200000n,
    value: 5000000n,
  });

  return mintTxnHash;
};
