import { task } from "hardhat/config";
import { PublicClient, HttpTransport, LocalECDSAKeySigner, type Hex, WalletV1, waitTillCompleted } from "@nilfoundation/niljs"
// import { PublicClient, HttpTransport, LocalECDSAKeySigner, type Hex, WalletV1, waitTillCompleted } from "../../nil.js"
import { config } from "dotenv";

config();

task("deploy_local", "Deploy the Sharded NFT contract").setAction(async (taskArgs, hre) => {

    const privateKey = process.env.PRIVATE_KEY as Hex | undefined;
    if (!privateKey) {
        throw new Error("PRIVATE_KEY is not set");
    }


    const shardId = 1;

    const provider = new hre.ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const wallet = new hre.ethers.Wallet(privateKey, provider);

    console.log('wallet address', wallet.address);
    console.log('wallet balance', await provider.getBalance(wallet.address));

    const artifact = await hre.artifacts.readArtifact("ShardedNFT");
    const abi = artifact.abi;
    const bytecode = artifact.bytecode as Hex;

    const factory = new hre.ethers.ContractFactory(abi, bytecode, wallet);
    const result = await factory.deploy(shardId, 4, 100);

    result.waitForDeployment();
    console.log('ShardeNFT local deployed at', await result.getAddress());
});
