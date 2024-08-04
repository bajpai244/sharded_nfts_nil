import { task } from "hardhat/config";
import {
  PublicClient,
  HttpTransport,
  LocalECDSAKeySigner,
  type Hex,
  WalletV1,
  waitTillCompleted,
} from "@nilfoundation/niljs";

import { config } from "dotenv";

config();

task("deploy", "Deploy the Sharded NFT contract").setAction(
  async (taskArgs, hre) => {
    const privateKey = process.env.PRIVATE_KEY as Hex | undefined;
    if (!privateKey) {
      throw new Error("PRIVATE_KEY is not set");
    }

    const walletAddress = process.env.WALLET_ADDR as Hex | undefined;
    if (!walletAddress) {
      throw new Error("WALLET_ADDR is not set");
    }

    const endpoint = process.env.NIL_RPC_ENDPOINT;
    if (!endpoint) {
      throw new Error("NIL_RPC_ENDPOINT is not set");
    }

    const client = new PublicClient({
      transport: new HttpTransport({
        endpoint,
      }),
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

    const totalNumberOfShards = 3;

    const artifact = await hre.artifacts.readArtifact("ShardedNFT");
    const abi = artifact.abi;
    const bytecode = artifact.bytecode as Hex;

    const wa = wallet.getAddressHex();
    console.log("wallet address: ", wa);

    for (let shardId = 1; shardId < totalNumberOfShards + 1; shardId++) {
      client.setShardId(shardId);

      const { address, hash } = await wallet.deployContract({
        bytecode,
        abi,
        salt: BigInt(Math.floor(Math.random() * 10000)),
        shardId,
        args: [shardId - 1, totalNumberOfShards, 100],
        gas: 200000n,
        value: 5000000n,
      });

      await waitTillCompleted(client, 1, hash);

      console.log("Contract deployed at address: ", address);
      console.log("Transaction hash: ", hash);
    }
  },
);
