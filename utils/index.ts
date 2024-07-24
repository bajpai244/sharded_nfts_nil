import { BenchmarkConfig, ENV } from "./types";
import { BenchmarkConfigSchema, EnvSchema } from "./zod";
import { readFileSync } from "fs";

export const getEnv = (): ENV => {
  return EnvSchema.parse(process.env);
};

export const getBenchmarkConfig = (
  benchmarkFilePath: string,
): BenchmarkConfig => {
  const benchmarkFileData = readFileSync(benchmarkFilePath, "utf-8");
  const benchmarkFileJson = JSON.parse(benchmarkFileData);

  return BenchmarkConfigSchema.parse(benchmarkFileJson);
};
