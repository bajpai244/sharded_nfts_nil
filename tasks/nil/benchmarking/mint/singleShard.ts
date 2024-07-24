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
import {
  CircularList,
  getBenchmarkConfig,
  getEnv,
  sleep,
} from "../../../../utils";
import { EnvSchema } from "../../../../utils/zod";
import { encodeFunctionData } from "viem";
import { writeFileSync } from "fs";

config();

task(
  "benchmark-mint-shard-size-1",
  "benchmark mints on single shard",
).setAction(async (taskArgs, hre) => {
  const shardId = 1;
  const totalShards = 1;

  const { BENCHMARK_CONFIG_FILE_PATH } = EnvSchema.pick({
    BENCHMARK_CONFIG_FILE_PATH: true,
  }).parse(process.env);

  const config = getBenchmarkConfig(BENCHMARK_CONFIG_FILE_PATH);
  const { deployerInfo } = config.ShardsInfo[shardId];

  const client = new PublicClient({
    transport: new HttpTransport({
      endpoint: config.NilRpcEndpoint,
    }),
    shardId: shardId,
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
  const totalSupply = 500;

  const { address: nftAddress, hash: nftDeployTxHash } =
    await wallet.deployContract({
      bytecode,
      abi,
      salt: BigInt(Math.floor(Math.random() * 10000)),
      shardId,
      // NOTE: We are using shardId-1 because shard 0 is supposed to be the master shard
      args: [shardId - 1, totalShards, totalSupply],
      gas: 200000n,
      value: 5000000n,
    });

  await waitTillCompleted(client, shardId, nftDeployTxHash);

  console.log("Contract deployed at address: ", nftAddress);
  console.log("Transaction hash: ", nftDeployTxHash);

  const walletsList = new CircularList(
    config.ShardsInfo[shardId].otherWalletsInfo,
  );

  const mintTxnHashList: Array<Hex> = [];
  const mintTxnPromiseList: Array<Promise<void>> = [];

  for (let idx = 0; idx < 180; idx += 1) {
    const { privateKey, walletAddress } = walletsList.next();
    const signer = new LocalECDSAKeySigner({
      privateKey: privateKey as Hex,
    });

    const pubKey = await signer.getPublicKey();

    const wallet = new WalletV1({
      pubkey: pubKey,
      client,
      signer,
      address: walletAddress as Hex,
    });

    const mintPromise = sendNftMintMessage({
      abi,
      nftAddress,
      tokenId: idx,
      wallet,
    }).then((txnHash) => {
      mintTxnHashList.push(txnHash);
    });

    mintTxnPromiseList.push(mintPromise);

    await sleep(50);
    console.log("sent txn for tokenId: ", idx);
  }

  await Promise.all(mintTxnPromiseList);
  console.log("successfully sent all mint transactions");

  const txnHashData = JSON.stringify(mintTxnHashList);

  writeFileSync("./mintTxnHashData.json", txnHashData);
  console.log("txn hash data written to file");
});

const sendNftMintMessage = async (arg: {
  abi: any[];
  nftAddress: Hex;
  tokenId: number;
  wallet: WalletV1;
}): Promise<Hex> => {
  const { abi, nftAddress, tokenId, wallet } = arg;

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
