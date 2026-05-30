// Throwaway RLS reproduction. Run: node --env-file=.env scripts/rls-probe.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("anonKey prefix:", anonKey?.slice(0, 12), "len", anonKey?.length);

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

const email = `rls-probe-${Date.now()}@example.com`;
const password = "Probe!23456";

const { data: created, error: cErr } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
if (cErr) {
  console.log("CREATE_USER_FAIL:", cErr.message);
  process.exit(1);
}
const userId = created.user.id;
console.log("created user:", userId);

// Sign in as that user with the ANON key (exactly like the browser/app).
const userClient = createClient(url, anonKey, { auth: { persistSession: false } });
const { data: signIn, error: sErr } = await userClient.auth.signInWithPassword({ email, password });
if (sErr) {
  console.log("SIGNIN_FAIL:", sErr.message);
} else {
  console.log("signed in, access token len:", signIn.session?.access_token?.length);
  // Decode JWT payload to confirm role + sub (auth.uid() == sub when role=authenticated).
  const payload = JSON.parse(
    Buffer.from(signIn.session.access_token.split(".")[1], "base64url").toString(),
  );
  console.log("JWT role:", payload.role, "| sub:", payload.sub, "| sub===userId:", payload.sub === userId);
  // Does the token reach Postgres? Read our own row count under user context.
  const sel = await userClient.from("office_files").select("id", { count: "exact", head: true });
  console.log("SELECT under user ctx:", sel.error ? `ERR ${sel.error.message}` : `ok (count=${sel.count})`);
  // Insert under the authenticated user context — this hits the RLS WITH CHECK.
  const ins = await userClient
    .from("office_files")
    .insert({ user_id: userId, type: "spreadsheet", name: "__rls_probe__", content: {} })
    .select()
    .single();
  if (ins.error) {
    console.log("INSERT_RLS_FAIL:", ins.error.code, ins.error.message);
  } else {
    console.log("INSERT_OK:", ins.data.id);
    await admin.from("office_files").delete().eq("id", ins.data.id);
  }
}

// Cleanup the throwaway user.
await admin.auth.admin.deleteUser(userId);
console.log("cleaned up user");
