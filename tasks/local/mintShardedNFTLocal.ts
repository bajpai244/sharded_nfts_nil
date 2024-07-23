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


    const nftAddress = process.env.NFT_CONTRACT_LOCAL_ADDR as Hex | undefined;
    if (!nftAddress) {
        throw new Error("NFT_CONTRACT_LOCAL_ADDR is not set");
    }

    console.log('nftAddress', nftAddress);

    const provider = new hre.ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const wallet = new hre.ethers.Wallet(privateKey, provider);

    console.log('wallet address', wallet.address);
    console.log('wallet balance', await provider.getBalance(wallet.address));

    const artifact = await hre.artifacts.readArtifact("ShardedNFT");
    const abi = artifact.abi;
    const bytecode = artifact.bytecode as Hex;

    const factory = new hre.ethers.ContractFactory(abi, bytecode, wallet);

    const contract = factory.attach(nftAddress);

    let mintResult = await contract.mintTo(wallet.address, 26);
    console.log('mint result', mintResult);
});
