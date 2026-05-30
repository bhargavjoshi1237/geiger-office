-- ─────────────────────────────────────────────────────────────────────────────
-- Geiger Office — RLS remediation (minimal, dependency-free)
-- Run in the Supabase SQL editor: Project → SQL Editor → New query → paste → Run.
--
-- Symptom this fixes:
--   42501  new row violates row-level security policy for table "office_files"
--   when creating any new file.
--
-- Cause: RLS is enabled on office_files but there is NO permissive INSERT policy,
-- so every insert is denied. (Reads/updates work because their policies exist.)
--
-- This script ONLY (re)creates the owner-only INSERT and DELETE policies. They
-- depend solely on the user_id column — no helper functions, no sharing columns —
-- so nothing here can fail and roll the change back. Safe to run repeatedly.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.office_files enable row level security;

-- INSERT: a user may create rows they own. (This is the missing piece.)
drop policy if exists "Users can create own files" on public.office_files;
create policy "Users can create own files"
  on public.office_files for insert
  with check (auth.uid() = user_id);

-- DELETE: a user may permanently delete rows they own.
drop policy if exists "Users can delete own files" on public.office_files;
create policy "Users can delete own files"
  on public.office_files for delete
  using (auth.uid() = user_id);

-- ── Verify ────────────────────────────────────────────────────────────────────
-- After running, you should see an INSERT and a DELETE row (plus whatever
-- SELECT/UPDATE policies already exist).
select policyname, cmd, qual as using_expr, with_check
from pg_policies
where schemaname = 'public' and tablename = 'office_files'
order by cmd;
