// Run all database/init/*.sql against the Supabase Postgres database.
//
//   node --env-file=.env scripts/migrate.mjs
//
// Requires a direct Postgres connection string in env as DATABASE_URL, e.g.
// the "Connection string" from Supabase dashboard → Project Settings → Database
// (use the Session/Transaction pooler URI, which is IPv4 and includes the DB
// password). The anon / service-role keys CANNOT run DDL — only this can.
//
// The SQL files are idempotent (IF NOT EXISTS / DROP POLICY IF EXISTS), so this
// is safe to re-run.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const initDir = path.join(__dirname, "..", "database", "init");
const ORDER = ["files.sql", "sharing.sql", "storage.sql"];

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "Missing DATABASE_URL. Add the Supabase Postgres connection string to .env\n" +
      "(Dashboard → Project Settings → Database → Connection string → pooler URI,\n" +
      " with your DB password), then re-run this script.",
  );
  process.exit(1);
}

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
await client.connect();

try {
  for (const file of ORDER) {
    const full = path.join(initDir, file);
    if (!fs.existsSync(full)) {
      console.warn(`skip ${file} (not found)`);
      continue;
    }
    const sql = fs.readFileSync(full, "utf8");
    process.stdout.write(`running ${file} … `);
    await client.query(sql);
    console.log("ok");
  }
  console.log("Migrations applied.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
