import { task } from "hardhat/config";
import {
  PublicClient,
  HttpTransport,
  LocalECDSAKeySigner,
  type Hex,
  WalletV1,
  waitTillCompleted,
} from "@nilfoundation/niljs";
import { readFileSync } from "node:fs";

import { config } from "dotenv";
import { TOTAL_NUMBER_OF_SHARDS } from "./contants";

config();

task("deploy", "Deploy the Sharded NFT contract").setAction(
  async (taskArgs, hre) => {
    const privateKey = process.env.PRIVATE_KEY as Hex | undefined;
    if (!privateKey) {
      throw new Error("PRIVATE_KEY is not set");
    }

    const endpoint = process.env.NIL_RPC_ENDPOINT;
    if (!endpoint) {
      throw new Error("NIL_RPC_ENDPOINT is not set");
    }

    const walletAddresses: {
      [key in string]: Hex;
    } = JSON.parse(readFileSync("./walletAddresses.json", "utf-8"));

    const client = new PublicClient({
      transport: new HttpTransport({
        endpoint,
      }),
    });

    const signer = new LocalECDSAKeySigner({
      privateKey,
    });

    const pubKey = await signer.getPublicKey();

    const artifact = await hre.artifacts.readArtifact("ShardedNFT");
    const abi = artifact.abi;
    const bytecode = artifact.bytecode as Hex;

    for (let shardId = 1; shardId <= TOTAL_NUMBER_OF_SHARDS; shardId++) {
      client.setShardId(shardId);

      const walletAddress = walletAddresses[`shard${shardId}`];
      console.log("Deploying contract via wallet: ", walletAddress);

      const wallet = new WalletV1({
        pubkey: pubKey,
        client,
        signer,
        address: walletAddress,
      });

      const { address, hash } = await wallet.deployContract({
        bytecode,
        abi,
        salt: BigInt(Math.floor(Math.random() * 10000)),
        shardId,
        args: [shardId - 1, TOTAL_NUMBER_OF_SHARDS, 100],
        gas: 200000n,
        value: 5000000n,
      });

      await waitTillCompleted(client, 1, hash);

      console.log("Contract deployed at address: ", address);
      console.log("Transaction hash: ", hash);
    }
  },
);
