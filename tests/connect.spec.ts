import path from "path";
import fs from "fs-extra";

import { readConfig } from "../src/utils/config";
import { connect } from "../src/utils/connect";

import logger from "./utils/logger";

describe("Connect", () => {
  beforeAll(() => {
    process.cwd = jest.fn(() => path.resolve(__dirname));
  });

  it("should connect to sqlite", async () => {
    const configuration = await readConfig(logger);

    const connection = connect(configuration);

    expect(connection).resolves.toBeDefined();

    await (await connection).destroy();
  });

  it("should create database status table", async () => {
    const configuration = await readConfig(logger);

    const connection = await connect(configuration);

    expect(await connection.schema.hasTable(configuration.tableName)).toBe(
      true
    );

    await (await connection).destroy();
  });

  afterEach(async () => {
    await fs.remove(path.resolve("temp.db"));
  });
});
