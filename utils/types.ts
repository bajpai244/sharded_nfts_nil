import { z } from "zod";
import { BenchmarkConfigSchema, EnvSchema } from "./zod";

export type ENV = z.infer<typeof EnvSchema>;

export type BenchmarkConfig = z.infer<typeof BenchmarkConfigSchema>;
