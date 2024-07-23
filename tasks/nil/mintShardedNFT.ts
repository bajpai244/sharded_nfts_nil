import { task } from "hardhat/config";
import { PublicClient, HttpTransport, LocalECDSAKeySigner, type Hex, WalletV1, waitTillCompleted } from "@nilfoundation/niljs"
// import { PublicClient, HttpTransport, LocalECDSAKeySigner, type Hex, WalletV1, waitTillCompleted } from "../../nil.js"
import { config } from "dotenv";
import { encodeFunctionData } from "viem";

config();

task("mint", "Mint sharded NFT").setAction(async (taskArgs, hre) => {

    const privateKey = process.env.PRIVATE_KEY as Hex | undefined;
    if (!privateKey) {
        throw new Error("PRIVATE_KEY is not set");
    }

    const walletAddress = process.env.WALLET_ADDR as Hex | undefined ;
    if (!walletAddress) {
        throw new Error("WALLET_ADDR is not set");
    }

    const endpoint = process.env.NIL_RPC_ENDPOINT;
    if (!endpoint) {
        throw new Error("NIL_RPC_ENDPOINT is not set");
    }

    const nftAddress = process.env.NFT_CONTRACT_ADDR as Hex | undefined;
    if (!nftAddress) {
        throw new Error("NFT_CONTRACT_ADDR is not set");
    }

    const shardId = 1;

    const client = new PublicClient({
        transport: new HttpTransport({
          endpoint
        }),
        shardId
      });


    const signer = new LocalECDSAKeySigner({
        privateKey
    });

    const pubKey = await signer.getPublicKey();

    const wallet = new WalletV1({
        pubkey: pubKey,
        client,
        signer,
        address: walletAddress
    })

    const wa = wallet.getAddressHex();
    console.log('wallet address: ', wa);

    const artifact = await hre.artifacts.readArtifact("ShardedNFT");
    const abi = artifact.abi;

    console.log("nftAddress is", nftAddress);

    const hash = await wallet.sendMessage({
        to: nftAddress,
       data: encodeFunctionData(
        {
         abi,
         functionName: "mintTo",
        args: [walletAddress.toLowerCase(), 26],
        }),
        gas: 200000n,
        value : 5000000n,
    });

    console.log('NFT mint transaction hash: ', hash);

const result =  await client.call({
        from: walletAddress,
        to: nftAddress,
        data: encodeFunctionData(
            {
                abi,
                functionName: "getShardID",
                args: [26]
            }
        ),
    }, "latest");

    console.log("shard ID to be deployed:", result);

    const currentShardIDResult =  await client.call({
        from: walletAddress,
        to: nftAddress,
        data: encodeFunctionData(
            {
                abi,
                functionName: "shardId",
                args: []
            }
        ),
    }, "latest");

    console.log("shard ID of the current contract:", currentShardIDResult);

});
