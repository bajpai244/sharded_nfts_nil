import { ENV } from "./types";
import { EnvSchema } from "./zod";

export const getEnv = (): ENV => {
  return EnvSchema.parse(process.env);
};
