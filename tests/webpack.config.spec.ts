import path from "path";

import { getConfiguration } from "../src/utils/webpack.config";

describe("WebpackConfiguration", () => {
  it("should map all files in entry", () => {
    const configuration = getConfiguration(
      ["any.ts", "file.ts"],
      process.cwd()
    );

    expect(configuration).toBeDefined();
    expect(configuration.entry).toEqual({
      any: path.resolve(process.cwd(), "any.ts"),
      file: path.resolve(process.cwd(), "file.ts"),
    });
  });

  it("should customize configuration", () => {
    const configuration = getConfiguration(
      ["any.ts", "file.ts"],
      process.cwd(),
      (config) => {
        config.resolve.alias = {
          "@": path.resolve("src"),
        };

        return config;
      }
    );

    expect(configuration).toBeDefined();
    expect(configuration.resolve.alias).toEqual({
      "@": path.resolve("src"),
    });
  });
});
