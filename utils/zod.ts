import { z } from "zod";

const privateKeySchema = z.string().startsWith("0x");
const contractAddressSchema = z.string().startsWith("0x");

export const EnvSchema = z.object({
  NIL_RPC_ENDPOINT: z.string().url(),
  PRIVATE_KEY: privateKeySchema,
  WALLET_ADDR: contractAddressSchema,
  BENCHMARK_CONFIG_FILE_PATH: z.string(),
});

const AccountInfoSchema = z.object({
  privateKey: privateKeySchema,
  walletAddress: contractAddressSchema,
});

const ShardInfoSchema = z.object({
  deployerInfo: AccountInfoSchema,
  otherWalletsInfo: z.array(AccountInfoSchema),
});

export const BenchmarkConfigSchema = z.object({
  NilRpcEndpoint: z.string().url(),
  ShardsInfo: z.object({
    "0": ShardInfoSchema,
    "1": ShardInfoSchema,
    "2": ShardInfoSchema,
    "3": ShardInfoSchema,
  }),
});
