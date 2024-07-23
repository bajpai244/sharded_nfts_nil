import { task } from "hardhat/config";
import { PublicClient, HttpTransport, LocalECDSAKeySigner, type Hex, WalletV1, waitTillCompleted } from "@nilfoundation/niljs"
// import { PublicClient, HttpTransport, LocalECDSAKeySigner, type Hex, WalletV1, waitTillCompleted } from "../../nil.js"
import { config } from "dotenv";
import { encodeFunctionData } from "viem";

config();

task("mint_local", "Mint sharded NFT").setAction(async (taskArgs, hre) => {

    const privateKey = process.env.PRIVATE_KEY as Hex | undefined;
    if (!privateKey) {
        throw new Error("PRIVATE_KEY is not set");
    }


    const nftAddress = "0x47623ee2cD178Bb38431Efe88E77a1cdea070B44";
    const shardId = 1;

    const provider = new hre.ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const wallet = new hre.ethers.Wallet(privateKey, provider);

    console.log('wallet address', wallet.address);
    console.log('wallet balance', await provider.getBalance(wallet.address));

    const artifact = await hre.artifacts.readArtifact("ShardedNFT");
    const abi = artifact.abi;
    const bytecode = artifact.bytecode as Hex;

    const factory = new hre.ethers.ContractFactory(abi, bytecode, wallet);

    const contract = factory.attach(nftAddress);

    // const result = await contract.mintTo(wallet.address, 1);

    const result = await contract.getShardID(1);
    console.log('result', result);


});
