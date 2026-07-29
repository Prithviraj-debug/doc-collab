import { Pool } from "pg"

const globalForDb = globalThis as unknown as { pgPool?: Pool }

function createPool() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }

  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
  })
}

export const pool = globalForDb.pgPool ?? createPool()

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool
}
