import { task } from "hardhat/config";
// import { PublicClient, HttpTransport, LocalECDSAKeySigner, type Hex, WalletV1, waitTillCompleted } from "@nilfoundation/niljs"
import { PublicClient, HttpTransport, LocalECDSAKeySigner, type Hex, WalletV1, waitTillCompleted } from "../../nil.js/dist/niljs.js"
import { config } from "dotenv";

config();

task("deploy", "Depoly the Incrementer contract").setAction(async (taskArgs, hre) => {

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

    const artifact = await hre.artifacts.readArtifact("Incrementer");
    const abi = artifact.abi;
    const bytecode = artifact.bytecode as Hex;

    const gasPrice = await client.getGasPrice(shardId);

    const {address, hash}  = await wallet.deployContract({
      bytecode,
      abi,
      salt: BigInt(Math.floor(Math.random() * 10000)),
      shardId,
      feeCredit: 1000000n * gasPrice,
      args: []
    });


    await waitTillCompleted(client, 1, hash);

    console.log('Contract deployed at address: ', address);
    console.log('Transaction hash: ', hash);

});
