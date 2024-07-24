import { z } from "zod";

export const EnvSchema = z.object({
  NIL_RPC_ENDPOINT: z.string().url(),
  PRIVATE_KEY: z.string().startsWith("0x"),
  WALLET_ADDR: z.string().startsWith("0x"),
});

const AccountInfoSchema = z.object({
  privateKey: z.string(),
  walletAddress: z.string().startsWith("0x"),
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
    "4": ShardInfoSchema,
  }),
});
