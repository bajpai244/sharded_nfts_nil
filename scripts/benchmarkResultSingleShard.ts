import { Hex, HttpTransport, PublicClient } from "@nilfoundation/niljs";
import { readFileSync } from "fs";
import { getBenchmarkConfig, sortBigIntListAsc, sleep } from "../utils";
import { EnvSchema } from "../utils/zod";

const main = async () => {
  const benchmarkResultFilePath = "./mintTxnHashData.json";
  const benchmarkResultData: Array<Hex> = JSON.parse(
    readFileSync(benchmarkResultFilePath, "utf-8"),
  );

  const shardId = 1;

  const { BENCHMARK_CONFIG_FILE_PATH } = EnvSchema.pick({
    BENCHMARK_CONFIG_FILE_PATH: true,
  }).parse(process.env);
  const config = getBenchmarkConfig(BENCHMARK_CONFIG_FILE_PATH);

  const client = new PublicClient({
    transport: new HttpTransport({
      endpoint: config.NilRpcEndpoint,
    }),
    shardId,
  });

  const blockLists: Array<bigint> = [];

  for (const txnHash of benchmarkResultData) {
    const receipt = await client.getMessageReceiptByHash(txnHash);
    receipt?.outputReceipts?.forEach((receipt) => {
      if (receipt) {
        if (!receipt.success) {
          throw new Error(`Transaction failed with hash: ${txnHash}`);
        }
      }
    });

    const blockNumber = receipt?.blockNumber;
    if (!blockNumber) {
      throw new Error(`Block number not found for txnHash: ${txnHash}`);
    }

    blockLists.push(blockNumber);

    await sleep(100);
  }

  const sortedBlockNumbers = Array.from(new Set(sortBigIntListAsc(blockLists)));
  console.log("Sorted Block Numbers", sortedBlockNumbers);

  const totalBlockTime =
    sortedBlockNumbers[sortedBlockNumbers.length - 1] - sortedBlockNumbers[0];
  console.log("Total Block Time", totalBlockTime);

  process.exit(0);
};

main();
