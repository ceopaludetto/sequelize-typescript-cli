import chalk from "chalk";

import { Logger } from "../src/utils/logger";

describe("Logger", () => {
  it("should call console.log", () => {
    const logger = new Logger();

    console.log = jest.fn((...msg) => msg.join(" "));

    expect(logger.info("test")).toBe(
      chalk.blue("info") + " " + chalk.reset("test")
    );

    expect(logger.success("test")).toBe(
      chalk.green("success") + " " + chalk.reset("test")
    );

    expect(logger.error("test")).toBe(
      chalk.red("error") + " " + chalk.reset("test")
    );

    expect(logger.verbose("test")).toBe(
      chalk.yellow("verbose") + " " + chalk.reset("test")
    );

    expect(logger.log("test")).toBe("test");
  });
});
