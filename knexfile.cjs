const path = require("node:path");
require("dotenv").config();

const migrationsDirectory = path.join(__dirname, "server", "migrations");
const seedsDirectory = path.join(__dirname, "server", "seeds");

const sharedConfig = {
  client: "pg",
  migrations: {
    directory: migrationsDirectory,
    extension: "js",
  },
  seeds: {
    directory: seedsDirectory,
    extension: "js",
  },
  pool: {
    min: Number(process.env.DB_POOL_MIN ?? 2),
    max: Number(process.env.DB_POOL_MAX ?? 10),
  },
};

const connection = process.env.DATABASE_URL;
if (!connection) {
  throw new Error(
    "DATABASE_URL is required. For Supabase, use your Postgres connection string.",
  );
}

module.exports = {
  development: {
    ...sharedConfig,
    connection,
  },
  production: {
    ...sharedConfig,
    connection,
  },
};
