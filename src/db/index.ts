import "server-only";
import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// node-postgres + Vercel Fluid compute, per Neon's guidance for Vercel. Use the
// pooled (-pooler) connection string here; migrations use the direct one.
const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set. Run `neon deploy` or `neon env pull`.");
}

const globalForDb = globalThis as unknown as { pgPool?: Pool };
// Reuse one pool across dev hot reloads.
const pool = globalForDb.pgPool ?? new Pool({ connectionString: url });
if (process.env.NODE_ENV !== "production") globalForDb.pgPool = pool;
// Lets Vercel close idle clients before a function instance is suspended.
attachDatabasePool(pool);

export const db = drizzle({ client: pool, schema, casing: "snake_case" });
