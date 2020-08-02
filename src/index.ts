#! /usr/bin/node
import "reflect-metadata";
import { Command } from "commander";
import { Container } from "typedi";

import { genConfig } from "./utils/config";
import {
  GenerateAction,
  CompileAction,
  NormalizeAction,
  RunAction,
  StatusAction,
  BaseAction,
} from "./helpers/actions";

const program = new Command("database")
  .option(
    "-e, --enviroment <env>",
    "Set the enviroment used by sequelize",
    process.env.NODE_ENV ?? "development"
  )
  .option("-v, --verbose", "Set the log level to verbose", false);

program
  .command("init")
  .alias("i")
  .description("Create a new configuration file in current directory")
  .action(() => {
    const base = Container.get(BaseAction);
    genConfig(base.logger).catch((error) => base.logger.error(error.message));
  });

program
  .command("compile [type]")
  .alias("c")
  .description("Compile seeds|migrations in tmp path")
  .action(async (type) => {
    const base = Container.get(BaseAction);

    const compile = Container.get(CompileAction);
    await compile.run(type).catch((error) => base.logger.error(error.message));
  });

program
  .command("generate <type> <name>")
  .alias("g")
  .description("Generate a new seed|migration")
  .action(async (type, name) => {
    const base = Container.get(BaseAction);

    const generate = Container.get(GenerateAction);
    await generate
      .run(type, name)
      .catch((error) => base.logger.error(error.message));
  });

program
  .command("normalize <from> [to]")
  .alias("n")
  .description("Normalize date format in filename")
  .action(async (from, to) => {
    const base = Container.get(BaseAction);

    const normalize = Container.get(NormalizeAction);
    await normalize
      .run(from, to)
      .catch((error) => base.logger.error(error.message));
  });

program
  .command("run <type> [name]")
  .alias("r")
  .option("--undo [name]", "Undo seed|migration")
  .option("--clean", "Clean tmp folder after run")
  .description("Run seed|migration")
  .action(async (type, name, p) => {
    const base = Container.get(BaseAction);

    const compile = Container.get(CompileAction);
    await compile.run(type).catch((error) => base.logger.error(error.message));

    const run = Container.get(RunAction);
    await run
      .run(type, name, p)
      .catch((error) => base.logger.error(error.message));
  });

program
  .command("status [type]")
  .alias("st")
  .action(async (type) => {
    const base = Container.get(BaseAction);

    const compile = Container.get(CompileAction);
    await compile.run(type).catch((error) => base.logger.error(error.message));

    const status = Container.get(StatusAction);
    await status.run(type).catch((error) => base.logger.error(error.message));
  });

export async function bootstrap() {
  const base = Container.get(BaseAction);
  try {
    const { version } = require("../package.json");
    program.version(version);

    await program.parseAsync(process.argv);

    if (base.hasSequelize()) {
      base.logger.verbose("Closing database connection");
      await (await base.getConnection()).destroy();
    }
  } catch (error) {
    base.logger.error(error.message);
  }
}
