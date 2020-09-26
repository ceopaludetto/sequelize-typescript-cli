const path = require("path");

module.exports = {
  knex: {
    client: "sqlite3",
    connection: {
      filename: "./temp.db",
    },
    useNullAsDefault: true,
  },
  migrations: "./src/server/database/migrations",
  seeds: "./src/server/database/seeds",
};
