import { task, types } from "hardhat/config";
import { HttpTransport, LocalECDSAKeySigner, PublicClient, waitTillCompleted, WalletV1, type Hex } from "@nilfoundation/niljs";
import { config } from "dotenv";
import { getContractDeployments, getContractFromShardId, getNftAbi, getWalletDeployments, getWalletFromShardId, sleep } from "./lib";
import { EnvSchema } from "../../utils/zod";
import { Abi, encodeFunctionData } from "viem";


config();

task("mint", "Mint sharded NFT")
  .addParam("shardId", "The shard ID to mint to", undefined, types.int)
  .addParam("tokenId", "The token ID to mint", undefined, types.int)
  .setAction(async (taskArgs, hre) => {
    const walletDeployments = getWalletDeployments();
    const contractDeployments = getContractDeployments();
    const abi = getNftAbi();

    const { shardId, tokenId } = taskArgs;
    console.log(`Minting to shard ${shardId} for tokenId ${tokenId}`);

    const { NIL_RPC_ENDPOINT, PRIVATE_KEY } = EnvSchema.omit({
      WALLET_ADDR: true,
    }).parse(process.env);

    const client = new PublicClient({
      transport: new HttpTransport({
        endpoint: NIL_RPC_ENDPOINT,
      }),
      shardId,
    });

    const walletAddress = getWalletFromShardId(shardId, walletDeployments);
    console.log(`Wallet address: ${walletAddress}`);
    const contractAddress = getContractFromShardId(shardId, contractDeployments);
    console.log(`Contract address: ${contractAddress}`);

    const endpoint = process.env.NIL_RPC_ENDPOINT;
    if (!endpoint) {
      throw new Error("NIL_RPC_ENDPOINT is not set");
    }

    const signer = new LocalECDSAKeySigner({ privateKey: PRIVATE_KEY as Hex });
    const pubkey = await signer.getPublicKey();

    const wallet = new WalletV1({
      pubkey,
      address: walletAddress,
      shardId,
      client,
      signer
    });

    console.log("wallet created, address:", wallet.address);

    const gasPrice = await client.getGasPrice(shardId);

    const transactionHash = await wallet.sendMessage({
      to: contractAddress,
      data: encodeFunctionData({
        abi: abi as Abi,
        functionName: "mintTo",
        args: [walletAddress, tokenId],
      }),
      feeCredit: 100_000n * gasPrice
    });

    console.log(`transaction sent succesfully, txnHash: ${transactionHash}`);
    await waitTillCompleted(client, shardId, transactionHash);

    await sleep(1);

    const receipt = await client.getMessageReceiptByHash(transactionHash, shardId);
    console.log("message receipt:", receipt);

    const owner = await client.call({
      from: walletAddress,
      to: contractAddress,
      data: encodeFunctionData({
        abi,
        functionName: "ownerOf",
        args: [tokenId]
      }),
    }, "latest")

    console.log(`owner of ${tokenId} : ${owner}`);
  });
