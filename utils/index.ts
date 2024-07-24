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

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Circular List allows for a circular iteration over a list of elements.
export class CircularList<T> {
  currentIdx: number;
  list: Array<T>;

  constructor(list: Array<T>) {
    this.currentIdx = 0;
    this.list = list;
  }

  next(): T {
    const element = this.list[this.currentIdx];
    this.currentIdx = (this.currentIdx + 1) % this.list.length;
    return element;
  }
}

export const sortBigIntListAsc = (list: Array<bigint>): Array<bigint> => {
  return list.sort((a, b) => Number(a - b));
};
