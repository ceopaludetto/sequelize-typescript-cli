import { Service } from "typedi";
import knex from "knex";

import { readConfig } from "../../utils/config";
import { connect } from "../../utils/connect";
import { Configuration } from "../../utils/types";
import { Logger } from "../../utils/logger";

@Service()
export class BaseAction {
  private config!: Configuration;

  private knex!: ReturnType<typeof knex>;

  public readonly logger = new Logger();

  public async getConfig() {
    if (!this.config) {
      this.logger.verbose("Reading config");
      this.config = await readConfig(this.logger);
    }
    return this.config;
  }

  public async getConnection(config?: Configuration) {
    if (!this.knex && config) {
      this.logger.verbose("Connecting to database");
      this.knex = await connect(config);
    }

    return this.knex;
  }

  public hasSequelize() {
    return !!this.knex;
  }
}
