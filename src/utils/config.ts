import path from "path";
import fs from "fs-extra";

import { Logger } from "./logger";
import { possible } from "./files";
import { configSchema } from "./schemas";
import { configurationTemplate } from "./template";
import { Configuration } from "./types";

async function ensure(cwd: string) {
  return Promise.all(
    possible.map(async (p) => {
      return fs.pathExists(path.resolve(cwd, p));
    })
  );
}

export async function readConfig(logger: Logger): Promise<Configuration> {
  const cwd = process.cwd();

  const found = await ensure(cwd);

  if (found.some(Boolean)) {
    const count = found.filter(Boolean).length;

    if (count > 1) {
      logger.error("Only one configuration per project");
      throw new Error("Only one configuration per project");
    }

    const file = possible[found.indexOf(true)];
    const relative = path.resolve(cwd, file);

    const content = await import(relative);

    const config = (await configSchema.validate(
      content.default
    )) as Configuration;

    const stats = await fs.stat(config.tsConfig);

    config.importAsType = false;

    if (stats) {
      const tsConfigFile = await fs.readJSON(config.tsConfig);

      if (
        tsConfigFile &&
        tsConfigFile.importsNotUsedAsValues &&
        (tsConfigFile.importsNotUsedAsValues.toLowerCase() === "error" ||
          tsConfigFile.importsNotUsedAsValues.toLowerCase() === "remove")
      ) {
        config.importAsType = true;
      }
    }

    return config;
  } else {
    throw new Error("No configuration file found");
  }
}

export async function genConfig(logger: Logger) {
  const cwd = process.cwd();

  const found = await ensure(cwd);

  if (found.some(Boolean)) {
    throw new Error("Configuration already exists");
  } else {
    logger.info("Creating new configuration file");
    const relative = path.resolve(cwd, possible[0]);

    await fs.ensureFile(relative);

    await fs.writeFile(relative, configurationTemplate());
    logger.success("Configuration file successfully created");
    logger.log(`- ${relative}`);
  }
}
