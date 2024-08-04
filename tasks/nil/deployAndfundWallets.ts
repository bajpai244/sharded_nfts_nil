import { task } from "hardhat/config";
import {
  Faucet,
  type Hex,
  HttpTransport,
  LocalECDSAKeySigner,
  PublicClient,
  WalletV1,
} from "@nilfoundation/niljs";

import { config } from "dotenv";
import { EnvSchema } from "../../utils/zod";
import { writeFileSync } from "node:fs";
import { TOTAL_NUMBER_OF_SHARDS } from "./contants";

config();

task("deploy_and_fund_wallets", "Deploy and fund wallet").setAction(
  async (taskArgs, hre) => {
    const { NIL_RPC_ENDPOINT, PRIVATE_KEY } = EnvSchema.omit({
      WALLET_ADDR: true,
    }).parse(process.env);

    const client = new PublicClient({
      transport: new HttpTransport({
        endpoint: NIL_RPC_ENDPOINT,
      }),
    });

    const faucet = new Faucet(client);

    const signer = new LocalECDSAKeySigner({
      privateKey: PRIVATE_KEY as Hex,
    });

    const walletAddresses: string[] = [];

    for (let shardId = 1; shardId <= TOTAL_NUMBER_OF_SHARDS; shardId++) {
      client.setShardId(shardId);

      const pubkey = await signer.getPublicKey();

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

      walletAddresses.push(walletAddress);

      // 0.1 Eth
      await faucet.withdrawToWithRetry(walletAddress, 100000000000000000n);

      await wallet.selfDeploy(true);

      console.log("wallet deployed successfully");
    }

    writeFileSync(
      "./walletAddresses.json",
      JSON.stringify(walletAddresses, null),
    );
  },
);
