import { z } from "zod";

export const EnvSchema = z.object({
  NIL_RPC_ENDPOINT: z.string().url(),
  PRIVATE_KEY: z.string().startsWith("0x"),
  WALLET_ADDR: z.string().startsWith("0x"),
});
