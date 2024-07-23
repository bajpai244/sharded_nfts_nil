import { task } from "hardhat/config";
import { type Hex } from "@nilfoundation/niljs";
// import { PublicClient, HttpTransport, LocalECDSAKeySigner, type Hex, WalletV1, waitTillCompleted } from "../../nil.js"
import { config } from "dotenv";

config();

task("mint", "Mint sharded NFT").setAction(async (taskArgs, hre) => {
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

  const nftAddress = process.env.NFT_CONTRACT_ADDR as Hex | undefined;
  if (!nftAddress) {
    throw new Error("NFT_CONTRACT_ADDR is not set");
  }

  const NFTContract = await hre.ethers.getContractFactory("ShardedNFT");
  const nftContract = NFTContract.attach(nftAddress);

  const response = await nftContract.mintTo(walletAddress.toLowerCase(), 28);
  console.log(response);
});
