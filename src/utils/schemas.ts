import * as Yup from "yup";
import { Configuration } from "webpack";
import { Options } from "sequelize";

import * as Messages from "./messages";

export const configSchema = Yup.object({
  sequelize: Yup.mixed<Options>().required(Messages.REQUIRED),
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
    }),
  customize: Yup.mixed<(config: Configuration) => Configuration>()
    .nullable()
    .notRequired(),
});
