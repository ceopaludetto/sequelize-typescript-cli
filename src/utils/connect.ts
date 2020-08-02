import knex from "knex";

import { Configuration } from "./types";

export async function connect(config: Configuration) {
  const connection = knex(config.knex);

  if (!(await connection.schema.hasTable(config.tableName))) {
    await connection.schema.createTable(config.tableName, (table) => {
      table.increments();
      table.string("name").notNullable();
      table.enum("type", ["migration", "seed"]).notNullable();
      table.timestamp("createdAt").defaultTo(connection.fn.now());
      table.timestamp("updatedAt").defaultTo(connection.fn.now());
    });
  }

  return connection;
}
