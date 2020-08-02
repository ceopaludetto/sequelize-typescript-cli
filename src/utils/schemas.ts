import * as Yup from "yup";
import { Configuration } from "webpack";
import { Config } from "knex";

import * as Messages from "./messages";

export const configSchema = Yup.object({
  knex: Yup.mixed<Config>().required(Messages.REQUIRED),
  tableName: Yup.string()
    .notRequired()
    .default("DatabaseStatus"),
  migrations: Yup.string().required(Messages.REQUIRED),
  seeds: Yup.string().required(Messages.REQUIRED),
  banners: Yup.mixed<string | string[]>()
    .nullable()
    .notRequired(),
  dateFormat: Yup.string()
    .nullable()
    .notRequired()
    .test("slash", Messages.SLASH, (v: string) => {
      if (!v) {
        return true;
      }

      if (!/(\/|\\)/.test(v)) {
        return true;
      }

      return false;
    })
    .default("YYYY.MM.DD.HH.mm.ss"),
  customize: Yup.mixed<(config: Configuration) => Configuration>()
    .nullable()
    .notRequired(),
});
