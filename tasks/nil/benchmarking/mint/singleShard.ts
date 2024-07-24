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
import { getEnv } from "../../../../utils";

config();

task(
  "benchmark-mint-shard-size-1",
  "benchmark mints on single shard",
).setAction(async (taskArgs, hre) => {
  const { NIL_RPC_ENDPOINT, PRIVATE_KEY, WALLET_ADDR } = getEnv();

  const shardId = 1;

  const client = new PublicClient({
    transport: new HttpTransport({
      endpoint,
    }),
    shardId,
  });

  const signer = new LocalECDSAKeySigner({
    privateKey,
  });

  const pubKey = await signer.getPublicKey();

  const wallet = new WalletV1({
    pubkey: pubKey,
    client,
    signer,
    address: walletAddress,
  });

  const wa = wallet.getAddressHex();
  console.log("wallet address: ", wa);

  const artifact = await hre.artifacts.readArtifact("ShardedNFT");
  const abi = artifact.abi;
  const bytecode = artifact.bytecode as Hex;

  const { address, hash } = await wallet.deployContract({
    bytecode,
    abi,
    salt: BigInt(Math.floor(Math.random() * 10000)),
    shardId,
    args: [shardId, 4, 100],
    gas: 200000n,
    value: 5000000n,
  });

  await waitTillCompleted(client, 1, hash);

  console.log("Contract deployed at address: ", address);
  console.log("Transaction hash: ", hash);
});
