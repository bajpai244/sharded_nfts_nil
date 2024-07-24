import { z } from "zod";
import { EnvSchema } from "./zod";

export type ENV = z.infer<typeof EnvSchema>;
