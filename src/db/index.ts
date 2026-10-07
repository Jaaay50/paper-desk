import path from "node:path";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

const migrationsFolder = path.join(process.cwd(), "drizzle");

async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { default: postgres } = await import("postgres");
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const { migrate } = await import("drizzle-orm/postgres-js/migrator");
    const db = drizzle(postgres(url), { schema });
    await migrate(db, { migrationsFolder });
    return db;
  }
  // No DATABASE_URL: embedded Postgres (PGlite), persisted under .data/ for local dev.
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const db = drizzle(new PGlite(process.env.PGLITE_DIR ?? ".data/pglite"), { schema });
  await migrate(db, { migrationsFolder });
  return db;
}

let cached: Promise<Db> | undefined;
export function getDb(): Promise<Db> {
  return (cached ??= connect());
}
