import { Service, Inject } from "typedi";
import { kebabCase, capitalize } from "lodash";
import path from "path";
import fs from "fs-extra";
import dayjs from "dayjs";

import { BaseAction } from "./base.action";
import { migrationTemplate } from "../../utils/template";
import { Type } from "../../utils/types";

@Service()
export class GenerateAction {
  @Inject()
  private readonly base: BaseAction;

  public async run(type: Type, name: string) {
    this.base.logger.info(`Generating new ${type}`);

    const cwd = process.cwd();
    const config = await this.base.getConfig();
    const entry = type === "migration" ? "migrations" : "seeds";

    const format = config.dateFormat ?? "YYYY.MM.DD.HH.mm.ss";

    const kebab = dayjs().format(format) + "-" + kebabCase(name) + ".ts";

    const relative = path.resolve(cwd, config[entry], kebab);

    if (!(await fs.pathExists(relative))) {
      await fs.ensureFile(relative);
      await fs.writeFile(
        relative,
        migrationTemplate(config.importAsType, config.banners)
      );
    }

    this.base.logger.success(`${capitalize(type)} generated successfuly`);
  }
}
