import { Service, Inject } from "typedi";
import glob from "glob";
import path from "path";
import chalk from "chalk";
import { Sequelize } from "sequelize";

import { BaseAction, SequelizeStatus } from "./base.action";
import { Type } from "../../utils/types";

interface ExecOptions {
  sequelize: Sequelize;
  cwd: string;
  f: string;
  undo: boolean;
  type: Type;
  name?: string;
  model: SequelizeStatus | typeof SequelizeStatus;
}

function isInstance(
  undo: boolean,
  model: SequelizeStatus | typeof SequelizeStatus
): model is SequelizeStatus {
  return undo === true;
}

@Service()
export class RunAction {
  @Inject()
  private readonly base: BaseAction;

  public async exec({
    cwd,
    type,
    f,
    undo,
    sequelize,
    name,
    model,
  }: ExecOptions) {
    const tmp = path.resolve(cwd, "tmp", path.basename(f, ".ts") + ".js");

    process.stdout.write(`- ${f}: ${chalk.blue(undo ? "undoing" : "upping")}`);

    try {
      const module = await import(tmp);
      await module.default[undo ? "down" : "up"](
        sequelize.getQueryInterface(),
        sequelize.Sequelize
      );

      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(
        `- ${f}: ${chalk.green(undo ? "undone" : "upped")}\n`
      );

      if (isInstance(undo, model)) {
        await model.destroy();
      } else {
        await model.create({ type, name: name ?? f });
      }
    } catch (error) {
      console.log(`- ${f}:`, chalk.red("failure"));
      this.base.logger.error(error.message);
    }
  }

  public async run(
    type: Type,
    name: string,
    params: { undo: boolean; clean: boolean }
  ) {
    const config = await this.base.getConfig();
    const sequelize = await this.base.getSequelize(config);
    const model = await this.base.getStatusModel();
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

    const already = await model.findAll({ where: { type } });
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
            model: inst,
            sequelize,
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
            model,
            sequelize,
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
