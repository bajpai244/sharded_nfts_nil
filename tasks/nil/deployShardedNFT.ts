import { task } from "hardhat/config";
import {
  PublicClient,
  HttpTransport,
  LocalECDSAKeySigner,
  type Hex,
  WalletV1,
  waitTillCompleted,
} from "@nilfoundation/niljs";
import { readFileSync, writeFileSync } from "node:fs";

import { config } from "dotenv";
import { TOTAL_NUMBER_OF_SHARDS } from "./contants";
import { ContractDeployments, WalletDeployments } from "./types";

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

    const walletAddresses: WalletDeployments = JSON.parse(
      readFileSync("./walletAddresses.json", "utf-8"),
    );

    const client = new PublicClient({
      transport: new HttpTransport({
        endpoint,
      }),
    });

    const signer = new LocalECDSAKeySigner({
      privateKey,
    });

    const pubKey = await signer.getPublicKey();

    const deployments: ContractDeployments = {};

    const artifact = await hre.artifacts.readArtifact("ShardedNFT");
    const abi = artifact.abi;
    const bytecode = artifact.bytecode as Hex;

    for (let shardId = 1; shardId <= TOTAL_NUMBER_OF_SHARDS; shardId++) {
      client.setShardId(shardId);

      const { address: walletAddress } = walletAddresses[`shard${shardId}`];
      console.log("Deploying contract via wallet: ", walletAddress);

      const wallet = new WalletV1({
        pubkey: pubKey,
        client,
        signer,
        address: walletAddress,
      });

      
      const gasPrice = await client.getGasPrice(shardId);

      const { address, hash } = await wallet.deployContract({
        bytecode,
        abi,
        salt: BigInt(Math.floor(Math.random() * 10000)),
        shardId,
        args: [shardId, TOTAL_NUMBER_OF_SHARDS, 100],
        feeCredit: 100_000n * gasPrice,
        value: 100000n
      });

      await waitTillCompleted(client, shardId, hash);

      console.log("Contract deployed at address: ", address);
      console.log("Transaction hash: ", hash);

      deployments[`shard${shardId}`] = {
        address,
        transactionHash: hash,
      };
    }

    console.log("Writing contract deployments to file");
    writeFileSync("./deployments.json", JSON.stringify(deployments, null));
  },
);
