import path from "path";
import fs from "fs-extra";

import { Logger } from "./logger";
import { possible } from "./files";
import { configSchema } from "./schemas";
import { configurationTemplate } from "./template";
import { Configuration } from "./types";
import { hasImportUnusedAsType } from "./tsconfig";

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

    const config = await configSchema.validate(content.default);

    const stats = config.tsConfig ? await fs.stat(config.tsConfig) : undefined;

    let additional: Configuration = { ...config, importAsType: false };

    if (stats) {
      const tsConfigFile = config.tsConfig ? await import(config.tsConfig) : {};

      if (hasImportUnusedAsType(tsConfigFile)) {
        additional.importAsType = true;
      }
    }

    return additional;
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
