import { Configuration } from "webpack";
import externals from "webpack-node-externals";
import path from "path";

export function getConfiguration(
  files: string[],
  cwd: string,
  customize?: (config: Configuration) => Configuration
): Configuration {
  let base: Configuration = {
    bail: true,
    target: "node",
    mode: "none",
    context: cwd,
    externals: [externals()],
    entry: files.reduce((entries, filename) => {
      const name = path.basename(filename, ".ts");
      return { ...entries, [name]: path.resolve(cwd, filename) };
    }, {}),
    output: {
      path: path.resolve(cwd, "tmp"),
      libraryTarget: "commonjs2",
      filename: "[name].js",
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true,
                configFile: path.resolve(cwd, "tsconfig.json"),
              },
            },
          ],
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".js", ".json", ".ts"],
    },
  };

  if (customize) {
    base = customize(base);
  }

  return base;
}
