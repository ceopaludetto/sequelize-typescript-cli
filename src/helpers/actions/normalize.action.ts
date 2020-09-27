import { Service, Inject } from "typedi";
import glob from "glob";
import path from "path";
import fs from "fs-extra";
import dayjs from "dayjs";
import CustomParse from "dayjs/plugin/customParseFormat";
import { kebabCase } from "lodash";

import { BaseAction } from "./base.action";

dayjs.extend(CustomParse);

@Service()
export class NormalizeAction {
  @Inject()
  private readonly base!: BaseAction;

  private async rename(p: string, from: string, to: string, cwd: string) {
    const files = glob.sync(p + "/*.ts", { cwd });

    return Promise.all(
      files.map((f) => {
        const basename = path.basename(f);

        const [date, ...filename] = basename.split("-");

        const day = dayjs(date, from);

        return fs.rename(
          path.resolve(cwd, f),
          path.resolve(
            cwd,
            p,
            `${day.format(to)}-${kebabCase(filename.join("-")).replace(
              "-ts",
              ".ts"
            )}`
          )
        );
      })
    );
  }

  public async run(from: string, to?: string) {
    const config = await this.base.getConfig();
    const cwd = process.cwd();

    this.base.logger.info("Changing format of files");
    const format = to ?? config.dateFormat ?? "YYYY.MM.DD.HH.mm.ss";

    if (!format) {
      throw new Error("Format must be passed");
    }

    this.base.logger.info("Renaming");
    await this.rename(config.migrations, from, format, cwd);
    await this.rename(config.seeds, from, format, cwd);
    this.base.logger.success("Files renamed successfully");
  }
}
