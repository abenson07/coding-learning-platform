const path = require("node:path");
const Knex = require("knex");
const { DataType, newDb } = require("pg-mem");
require("dotenv").config();

const migrationsDirectory = path.join(__dirname, "migrations");
const seedsDirectory = path.join(__dirname, "seeds");

function createKnexConfig() {
  const baseConfig = {
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

  const useInMemoryTestDatabase =
    (process.env.NODE_ENV === "test" || process.env.VITEST === "true") &&
    !process.env.DATABASE_URL;

  if (useInMemoryTestDatabase) {
    const memoryDb = newDb();
    memoryDb.public.registerFunction({
      name: "version",
      args: [],
      returns: DataType.text,
      implementation: () => "PostgreSQL 16.0",
    });
    const pgMem = memoryDb.adapters.createPg();
    const pg = require("pg");
    pg.Client = pgMem.Client;
    pg.Pool = pgMem.Pool;
    return {
      ...baseConfig,
      connection: "postgresql://postgres:postgres@localhost:5432/test-db",
    };
  }

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required. For Supabase, use your Postgres connection string.",
    );
  }

  return {
    ...baseConfig,
    connection: process.env.DATABASE_URL,
  };
}

const db = Knex(createKnexConfig());

module.exports = {
  db,
};
