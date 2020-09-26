import { Service, Inject } from "typedi";
import glob from "glob";
import path from "path";
import chalk from "chalk";
import knex from "knex";

import { BaseAction } from "./base.action";
import { Type, Configuration } from "../../utils/types";

interface ExecOptions {
  knex: ReturnType<typeof knex>;
  cwd: string;
  f: string;
  undo: boolean;
  type: Type;
  name?: string;
  config: Configuration;
}

@Service()
export class RunAction {
  @Inject()
  private readonly base: BaseAction;

  public async exec({ cwd, type, f, undo, knex, name, config }: ExecOptions) {
    const tmp = path.resolve(cwd, "tmp", path.basename(f, ".ts") + ".js");

    process.stdout.write(`- ${f}: ${chalk.blue(undo ? "undoing" : "upping")}`);

    try {
      const module = await import(tmp);
      await module.default[undo ? "down" : "up"](knex);

      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(
        `- ${f}: ${chalk.green(undo ? "undone" : "upped")}\n`
      );

      if (undo) {
        await knex(config.tableName)
          .delete()
          .where("name", path.basename(f, ".ts"));
      } else {
        await knex(config.tableName).insert({ type, name: name ?? f });
      }
    } catch (error) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(`- ${f}: ${chalk.red("failure")}\n`);
      this.base.logger.error(error.message);
    }
  }

  public async run(
    type: Type,
    name: string,
    params: { undo: boolean; clean: boolean }
  ) {
    const config = await this.base.getConfig();
    const knex = await this.base.getConnection(config);
    const cwd = process.cwd();

    const p = type === "migration" ? config.migrations : config.seeds;
    let files = glob.sync(p + "/*.ts", { cwd: cwd });

    this.base.logger.verbose(`Capturing already runned ${type}s`);
    if (name) {
      const i = files.indexOf(
        files.find((x) => path.basename(x, ".ts") === name)
      );

      if (params.undo) {
        files = files.slice(0, files.length - i + 2);
      } else {
        files = files.slice(0, i + 1);
      }
    }

    const already = await knex(config.tableName)
      .select()
      .where("type", type);
    this.base.logger.info(`Founded ${files.length} ${type}s`);

    if (params.undo) {
      let i = 0;
      for (const f of files.reverse()) {
        const inst = already.find((a) => path.basename(f).includes(a.name));

        if (inst) {
          await this.exec({
            cwd,
            f,
            undo: true,
            type,
            name: path.basename(f, ".ts"),
            knex,
            config,
          });

          i += 1;
        }
      }

      if (i) {
        this.base.logger.success(`Success undone ${i} ${type}s`);
      }
    } else {
      let i = 0;
      for (const f of files) {
        const inst = already.find((a) => path.basename(f).includes(a.name));

        if (!inst) {
          await this.exec({
            cwd,
            f,
            undo: false,
            type,
            name: path.basename(f, ".ts"),
            knex,
            config,
          });

          i += 1;
        }
      }

      if (i) {
        this.base.logger.success(`Success upped ${i} ${type}s`);
      }
    }
  }
}
