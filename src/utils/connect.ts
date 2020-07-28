import { Sequelize, Model, DataTypes } from "sequelize";

import { Configuration, Type } from "./types";

interface SequelizeStatusAttributes {
  name: string;
  type: Type;
}

export class SequelizeStatus extends Model<SequelizeStatusAttributes>
  implements SequelizeStatusAttributes {
  public name!: string;

  public type!: Type;
}

export async function connect(
  config: Configuration
): Promise<[Sequelize, typeof SequelizeStatus]> {
  const sequelize = new Sequelize({ ...config.sequelize, logging: false });

  SequelizeStatus.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("seed", "migration"),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "SequelizeStatus",
      modelName: "SequelizeStatus",
      freezeTableName: true,
    }
  );

  await sequelize.authenticate();

  await sequelize.sync();

  return [sequelize, SequelizeStatus];
}
