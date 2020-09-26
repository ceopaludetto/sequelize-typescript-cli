const path = require("path");

module.exports = {
  knex: {
    client: "sqlite3",
    connection: {
      filename: "./temp.db",
    },
  },
  migrations: "./src/server/database/migrations",
  seeds: "./src/server/database/seeds",
};
