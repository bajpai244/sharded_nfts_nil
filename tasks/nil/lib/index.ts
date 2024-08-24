import { WalletDeployments, ContractDeployments } from '../types';
import { TOTAL_NUMBER_OF_SHARDS } from '../contants';
import {readFileSync} from "node:fs"
import { Hex } from '@nilfoundation/niljs';

export function getWalletFromShardId(shardId: number, wallets: WalletDeployments): Hex {
  if (shardId < 1 || shardId >= TOTAL_NUMBER_OF_SHARDS) {
    throw new Error(`Invalid shard ID. Must be between 1 and ${TOTAL_NUMBER_OF_SHARDS - 1}`);
  }
  
  const walletKey = `shard${shardId}` as keyof WalletDeployments;
  const wallet = wallets[walletKey];
  
  if (!wallet) {
    throw new Error(`No wallet found for shard ${shardId}`);
  }
  
  return wallet.address;
}

export function getContractFromShardId(shardId: number, contracts: ContractDeployments): Hex {
  if (shardId < 1 || shardId >= TOTAL_NUMBER_OF_SHARDS) {
    throw new Error(`Invalid shard ID. Must be between 1 and ${TOTAL_NUMBER_OF_SHARDS - 1}`);
  }
  
  const contractKey = `shard${shardId}` as keyof ContractDeployments;
  const contract = contracts[contractKey];
  
  if (!contract) {
    throw new Error(`No contract found for shard ${shardId}`);
  }
  
  return contract.address;
}


export const getWalletDeployments = (): WalletDeployments => {
   // Read the walletAddresses.json file
  // TODO: This should be part of the environment
  const walletAddressesData = readFileSync("./walletAddresses.json", 'utf8');
  return JSON.parse(walletAddressesData);
}

export const getContractDeployments = (): ContractDeployments => {
  // Read the deployments.json file
  // TODO: This should be part of the environment
  const contractAddressesData = readFileSync("./deployments.json", 'utf8');
  return JSON.parse(contractAddressesData);
}

export const getNftAbi = () => {
  // TODO: This should be part of the environment
  const artifact = JSON.parse(readFileSync('./artifacts/contracts/NFT.sol/ShardedNFT.json', 'utf8'));
  return artifact.abi;
};

/**
 * Pauses the execution for the specified number of seconds.
 * 
 * @param seconds The number of seconds to sleep.
 * @returns A Promise that resolves after the specified time.
 */
export function sleep(seconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
