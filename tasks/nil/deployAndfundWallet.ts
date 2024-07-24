import { task } from "hardhat/config";
import {
  Faucet,
  Hex,
  HttpTransport,
  LocalECDSAKeySigner,
  PublicClient,
  WalletV1,
  generateRandomPrivateKey,
} from "@nilfoundation/niljs";

import { config } from "dotenv";
import { EnvSchema } from "../../utils/zod";
import { bigint } from "zod";
config();

task("deploy_and_fund_wallet", "Deploy and fund wallet")
  .addParam<number>("shard", "The shard Id to deploy this wallet to")
  .setAction(async (taskArgs, hre) => {
    const { NIL_RPC_ENDPOINT, PRIVATE_KEY } = EnvSchema.omit({
      WALLET_ADDR: true,
    }).parse(process.env);

    const shardId = parseInt(taskArgs.shard);

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

    console.log("wallet deployed successfully");
  });

//   const faucet = new Faucet(client);

//   const signer = new LocalECDSAKeySigner({
//     privateKey: generateRandomPrivateKey(),
//   });

//   const pubkey = await signer.getPublicKey();

//   const wallet = new WalletV1({
//     pubkey: pubkey,
//     salt: 100n,
//     shardId: 1,
//     client,
//     signer,
//   });
//   const walletAddress = await wallet.getAddressHex();

//   await faucet.withdrawToWithRetry(walletAddress, 100000n);

//   await wallet.selfDeploy(true);
