-- ─────────────────────────────────────────────────────────────────────────────
-- Geiger Office — sharing & access control
-- Run AFTER files.sql (it extends public.office_files).
--
-- Mirrors the Google-Docs sharing model:
--   • Per-person grants  → public.office_file_shares (email + role)
--   • General access     → office_files.visibility ('restricted' | 'link')
--                          with office_files.link_role for the link's role.
--
-- Roles: 'viewer' (read), 'commenter' (read + comment), 'editor' (read + write).
-- "Anyone with the link" requires the visitor to be SIGNED IN (no anonymous
-- access) — enforced in office_file_role() by the `auth.uid() is not null` guard.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── General-access columns on office_files ────────────────────────────────────
alter table public.office_files
  add column if not exists visibility text not null default 'restricted'
    check (visibility in ('restricted', 'link'));

alter table public.office_files
  add column if not exists link_role text not null default 'viewer'
    check (link_role in ('viewer', 'commenter', 'editor'));

-- ── Per-person shares ─────────────────────────────────────────────────────────
create table if not exists public.office_file_shares (
  id          uuid        primary key default gen_random_uuid(),
  file_id     uuid        not null references public.office_files(id) on delete cascade,

  -- Invitee identity. email is the source of truth (the person may not have an
  -- account yet); user_id is an optional resolved link to an auth user.
  email       text        not null,
  user_id     uuid        references auth.users(id) on delete cascade,

  role        text        not null default 'viewer'
                          check (role in ('viewer', 'commenter', 'editor')),

  created_at  timestamptz not null default now(),

  unique (file_id, email)
);

create index if not exists office_file_shares_file_idx  on public.office_file_shares (file_id);
create index if not exists office_file_shares_email_idx on public.office_file_shares (lower(email));
create index if not exists office_file_shares_user_idx  on public.office_file_shares (user_id);

-- ── Access helpers ────────────────────────────────────────────────────────────
-- SECURITY DEFINER → these run as the table owner and BYPASS RLS, so the policies
-- below can call them without the office_files ⇄ office_file_shares cross-reference
-- triggering "infinite recursion detected in policy".
create or replace function public.office_file_role(f_id uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select case
    when f.user_id = auth.uid()                            then 'owner'
    when s.role is not null                                then s.role
    when f.visibility = 'link' and auth.uid() is not null  then f.link_role
    else null
  end
  from public.office_files f
  left join public.office_file_shares s
    on s.file_id = f.id
   and (s.user_id = auth.uid() or lower(s.email) = lower(auth.jwt() ->> 'email'))
  where f.id = f_id
  order by (s.role is not null) desc
  limit 1;
$$;

create or replace function public.can_view_file(f_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select public.office_file_role(f_id) is not null;
$$;

create or replace function public.can_edit_file(f_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select public.office_file_role(f_id) in ('owner', 'editor');
$$;

-- ── office_files RLS: replace owner-only view/update with access-aware policies ─
-- (INSERT / DELETE remain owner-only from files.sql.)
drop policy if exists "Users can view own files"   on public.office_files;
drop policy if exists "Users can update own files" on public.office_files;
drop policy if exists "View accessible files"      on public.office_files;
drop policy if exists "Update editable files"      on public.office_files;

create policy "View accessible files"
  on public.office_files for select
  using (public.can_view_file(id));

-- Editors may write rows; column-level rules (only owners change
-- visibility/starred/trashed/link_role) are enforced in the API layer.
create policy "Update editable files"
  on public.office_files for update
  using (public.can_edit_file(id))
  with check (public.can_edit_file(id));

-- ── office_file_shares RLS ────────────────────────────────────────────────────
alter table public.office_file_shares enable row level security;

drop policy if exists "Owner manages shares"   on public.office_file_shares;
drop policy if exists "Invitee views own share" on public.office_file_shares;

create policy "Owner manages shares"
  on public.office_file_shares for all
  using (
    exists (select 1 from public.office_files f
             where f.id = file_id and f.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.office_files f
             where f.id = file_id and f.user_id = auth.uid())
  );

create policy "Invitee views own share"
  on public.office_file_shares for select
  using (
    user_id = auth.uid()
    or lower(email) = lower(auth.jwt() ->> 'email')
  );

-- ── People typeahead for the share dialog ─────────────────────────────────────
-- Searches auth.users (not client-readable) via a SECURITY DEFINER function and
-- returns a small, safe projection. Name/avatar fall back gracefully when the
-- account has no OAuth metadata. Granted to authenticated users only.
--
-- Note: this lets any signed-in user look up colleagues by email/name (an email
-- lookup, like Google's contact suggestions) — appropriate for an internal
-- workspace. A 2-char minimum + small limit keep it from being a bulk dump.
create or replace function public.search_office_users(q text)
returns table (id uuid, email text, name text, avatar_url text)
language sql
security definer
stable
set search_path = public
as $$
  select
    u.id,
    u.email,
    coalesce(
      nullif(u.raw_user_meta_data ->> 'full_name', ''),
      nullif(u.raw_user_meta_data ->> 'name', ''),
      split_part(u.email, '@', 1)
    ) as name,
    coalesce(
      nullif(u.raw_user_meta_data ->> 'avatar_url', ''),
      nullif(u.raw_user_meta_data ->> 'picture', '')
    ) as avatar_url
  from auth.users u
  where length(coalesce(trim(q), '')) >= 2
    and u.id <> auth.uid()
    and (
      u.email ilike q || '%'
      or u.raw_user_meta_data ->> 'full_name' ilike '%' || q || '%'
      or u.raw_user_meta_data ->> 'name' ilike '%' || q || '%'
    )
  order by u.email
  limit 6;
$$;

revoke all on function public.search_office_users(text) from public, anon;
grant execute on function public.search_office_users(text) to authenticated;
