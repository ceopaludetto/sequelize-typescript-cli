import { Service, Inject } from "typedi";
import { capitalize } from "lodash";
import webpack from "webpack";
import glob from "glob";

import { BaseAction } from "./base.action";
import { getConfiguration } from "../../utils/webpack.config";
import { Type } from "../../utils/types";

@Service()
export class CompileAction {
  @Inject()
  private readonly base!: BaseAction;

  public async run(type?: Type) {
    const config = await this.base.getConfig();
    const cwd = process.cwd();

    if (type) {
      this.base.logger.info(`Compiling ${type}s`);

      const entry = type === "migration" ? "migrations" : "seeds";

      const path = glob.sync(config[entry] + "/*.ts", { cwd });

      const compiler = webpack(getConfiguration(path, cwd, config.customize));

      const res = await new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
          if (err) {
            return reject(err);
          }

          return resolve(stats);
        });
      });

      this.base.logger.success(`${capitalize(type)}s successfully compiled`);

      return res;
    } else {
      this.base.logger.info(`Compiling all`);
      const migrations = glob.sync(config.migrations + "/*.ts", { cwd });
      const seeds = glob.sync(config.seeds + "/*.ts", { cwd });

      const compilers: webpack.Compiler[] = [];

      if (migrations.length) {
        compilers.push(
          webpack(getConfiguration(migrations, cwd, config.customize))
        );
      }

      if (seeds.length) {
        compilers.push(webpack(getConfiguration(seeds, cwd, config.customize)));
      }

      const res = await Promise.all(
        compilers.map((c) => {
          return new Promise((resolve, reject) => {
            c.run((err, stats) => {
              if (err) {
                return reject(err);
              }

              return resolve(stats);
            });
          });
        })
      );

      this.base.logger.success("Migrations/Seeds successfully compiled");

      return res;
    }
  }
}
