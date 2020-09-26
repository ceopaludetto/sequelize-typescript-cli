import path from "path";
import fs from "fs-extra";

import { readConfig, genConfig } from "../src/utils/config";
import logger from "./utils/logger";

describe("Configuration file", () => {
  beforeEach(async () => {
    await fs.remove(path.resolve(__dirname, "tmp", "database.config.js"));
  });

  it("should find configuration file", async () => {
    process.cwd = jest.fn(() => path.resolve(__dirname));

    const config = await readConfig(logger);

    expect(config).toBeDefined();
    expect(config).toHaveProperty("migrations");
  });

  it("should throw if two or more configuration are provided", async () => {
    process.cwd = jest.fn(() => path.resolve(__dirname, "configurations"));

    const config = readConfig(logger);

    expect(config).rejects.toThrow();
  });

  it("should throw if no file are found", async () => {
    process.cwd = jest.fn(() => path.resolve("."));

    const config = readConfig(logger);

    expect(config).rejects.toThrow();
  });

  it("should gen configuration", async () => {
    process.cwd = jest.fn(() => path.resolve(__dirname, "tmp"));

    const file = path.resolve(process.cwd(), "database.config.js");

    await genConfig(logger);

    expect(fs.stat(file)).resolves.toBeDefined();
  });

  it("should throw if configuration already exists", async () => {
    process.cwd = jest.fn(() => path.resolve(__dirname, "tmp"));

    await genConfig(logger);

    expect(genConfig(logger)).rejects.toThrow();
  });

  afterEach(async () => {
    await fs.remove(path.resolve(__dirname, "tmp", "database.config.js"));
  });
});
