// One-off Phase 1 DB verification. Run: node --env-file=.env scripts/verify-db.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const probe = await admin.from("office_files").select("id").limit(1);
if (probe.error) {
  if (probe.error.code === "42P01") {
    console.log("TABLE_MISSING: office_files does not exist — run database/init/files.sql");
    process.exit(2);
  }
  console.log("PROBE_ERROR:", probe.error.code, probe.error.message);
  process.exit(1);
}
console.log("TABLE_OK: office_files exists");

// Round-trip using a real auth user (FK target).
const { data: usersData, error: usersErr } = await admin.auth.admin.listUsers({ perPage: 1 });
if (usersErr || !usersData?.users?.length) {
  console.log("NO_AUTH_USER: skipping insert round-trip (", usersErr?.message || "no users", ")");
  process.exit(0);
}
const userId = usersData.users[0].id;

const ins = await admin
  .from("office_files")
  .insert({ user_id: userId, type: "document", name: "__verify__", content: { type: "doc", content: [] } })
  .select()
  .single();
if (ins.error) {
  console.log("INSERT_FAIL:", ins.error.message);
  process.exit(1);
}
const row = ins.data;
const prevUpdated = row.updated_at;

const upd = await admin.from("office_files").update({ name: "__verify2__" }).eq("id", row.id).select().single();
const triggerWorks = upd.data && upd.data.updated_at !== prevUpdated;

await admin.from("office_files").delete().eq("id", row.id);

console.log(
  `ROUND_TRIP_OK: insert+update+delete; updated_at trigger ${triggerWorks ? "fires" : "DID NOT change"}`,
);
