-- ─────────────────────────────────────────────────────────────────────────────
-- Geiger Office — office_folders table
-- Run this in your Supabase SQL editor to add folder support.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.office_folders (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null default 'Untitled folder',
  color       text        not null default '#4285f4',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists office_folders_user_idx
  on public.office_folders (user_id, updated_at desc);

-- ── Row-Level Security (owner-only) ───────────────────────────────────────────
alter table public.office_folders enable row level security;

drop policy if exists "Users can view own folders"   on public.office_folders;
drop policy if exists "Users can create own folders" on public.office_folders;
drop policy if exists "Users can update own folders" on public.office_folders;
drop policy if exists "Users can delete own folders" on public.office_folders;

create policy "Users can view own folders"
  on public.office_folders for select
  using (auth.uid() = user_id);

create policy "Users can create own folders"
  on public.office_folders for insert
  with check (auth.uid() = user_id);

create policy "Users can update own folders"
  on public.office_folders for update
  using (auth.uid() = user_id);

create policy "Users can delete own folders"
  on public.office_folders for delete
  using (auth.uid() = user_id);

-- ── Auto-update updated_at on every write ─────────────────────────────────────
create or replace function public.update_office_folders_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists office_folders_updated_at on public.office_folders;
create trigger office_folders_updated_at
  before update on public.office_folders
  for each row execute function public.update_office_folders_updated_at();
