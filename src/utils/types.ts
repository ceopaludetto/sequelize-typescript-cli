import * as Yup from "yup";

import { configSchema } from "./schemas";

export type Type = "migration" | "seed";

export type Configuration = Yup.InferType<typeof configSchema> & {
  importAsType: boolean;
};
