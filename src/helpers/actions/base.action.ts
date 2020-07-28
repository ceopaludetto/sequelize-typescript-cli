import { Service } from "typedi";
import { Sequelize } from "sequelize";

import { readConfig } from "../../utils/config";
import { connect, SequelizeStatus } from "../../utils/connect";
import { Configuration } from "../../utils/types";
import { Logger } from "../../utils/logger";

export { SequelizeStatus };

@Service()
export class BaseAction {
  private config!: Configuration;

  private sequelize!: [Sequelize, typeof SequelizeStatus];

  public readonly logger = new Logger();

  public async getConfig() {
    if (!this.config) {
      this.logger.verbose("Reading config");
      this.config = await readConfig(this.logger);
    }
    return this.config;
  }

  public async getSequelize(config?: Configuration) {
    if (!this.sequelize && config) {
      this.logger.verbose("Connecting to database");
      this.sequelize = await connect(config);
    }

    return this.sequelize[0];
  }

  public hasSequelize() {
    return !!this.sequelize;
  }

  public async getStatusModel(config?: Configuration) {
    if (!this.sequelize && config) {
      this.logger.verbose("Connecting to database");
      this.sequelize = await connect(config);
    }

    return this.sequelize[1];
  }
}
