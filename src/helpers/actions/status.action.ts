import { Service, Inject } from "typedi";
import glob from "glob";
import chalk from "chalk";
import path from "path";

import { BaseAction } from "./base.action";
import { Type } from "../../utils/types";

@Service()
export class StatusAction {
  @Inject()
  private readonly base: BaseAction;

  private print(
    files: string[],
    runned: { name: string; type: Type }[],
    type: Type
  ) {
    for (const f of files) {
      const status = runned.find(
        (x) => x.name.includes(path.basename(f, ".ts")) && x.type === type
      );

      if (status) {
        console.log("-", f + ":", chalk.green("runned"));
      } else {
        console.log("-", f + ":", chalk.red("to run"));
      }
    }
  }

  public async run(type?: Type) {
    const config = await this.base.getConfig();
    const knex = await this.base.getConnection(config);
    const cwd = process.cwd();

    this.base.logger.info("Checking status");

    if (type) {
      const runned = await knex(config.tableName)
        .select()
        .where("type", type);

      const p = type === "migration" ? config.migrations : config.seeds;

      const files = glob.sync(p + "/*.ts", { cwd });

      this.base.logger.info(`Founded ${files.length} ${type}s`);

      this.print(files, runned, type);
    } else {
      const runned = await knex(config.tableName).select();

      const migrations = glob.sync(config.migrations + "/*.ts", {
        cwd,
      });
      const seeds = glob.sync(config.seeds + "/*.ts", { cwd });

      if (migrations.length) {
        this.base.logger.info(`Founded ${migrations.length} migrations`);

        this.print(migrations, runned, "migration");
      }

      if (seeds.length) {
        this.base.logger.info(`Founded ${seeds.length} seeds`);

        this.print(seeds, runned, "seed");
      }
    }

    this.base.logger.success("Check status runned succesfully");
  }
}
