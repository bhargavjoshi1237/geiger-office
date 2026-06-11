-- ─────────────────────────────────────────────────────────────────────────────
-- Geiger Office — office_files table
-- Run this in your Supabase SQL editor (same project as the rest of the suite).
--
-- One polymorphic table backs the /home file browser and all three editors.
-- `content` holds the editor's source-of-truth JSON:
--   document     -> Tiptap doc JSON
--   spreadsheet  -> { sheets, columnWidths, rowHeights }
--   presentation -> { slides }
-- Exports (.docx/.xlsx/.pptx/...) are generated on demand, never stored.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.office_files (
  id          uuid        primary key default gen_random_uuid(),

  -- Optional Geiger Flow project. NULL keeps standalone/personal Office valid.
  project_id  uuid        references public.flow_projects(id) on delete set null,

  -- Owner (Supabase Auth user shared across the suite)
  user_id     uuid        not null references auth.users(id) on delete cascade,

  -- Kind of file
  type        text        not null
                          check (type in ('document', 'spreadsheet', 'presentation')),

  -- Metadata
  name        text        not null default 'Untitled',
  content     jsonb       not null default '{}'::jsonb,
  thumbnail   text,

  -- Organisation flags
  starred     boolean     not null default false,
  trashed     boolean     not null default false,

  -- Timestamps
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Indexes (home list & filters) ─────────────────────────────────────────────
create index if not exists office_files_user_updated_idx
  on public.office_files (user_id, trashed, updated_at desc);
create index if not exists office_files_user_starred_idx
  on public.office_files (user_id, starred);
create index if not exists office_files_user_type_idx
  on public.office_files (user_id, type);
create index if not exists office_files_project_updated_idx
  on public.office_files (project_id, trashed, updated_at desc);

-- ── Row-Level Security (owner-only) ───────────────────────────────────────────
alter table public.office_files enable row level security;

drop policy if exists "Users can view own files"   on public.office_files;
drop policy if exists "Users can create own files" on public.office_files;
drop policy if exists "Users can update own files" on public.office_files;
drop policy if exists "Users can delete own files" on public.office_files;

create policy "Users can view own files"
  on public.office_files for select
  using (auth.uid() = user_id);

create policy "Users can create own files"
  on public.office_files for insert
  with check (
    auth.uid() = user_id
    and (project_id is null or public.flow_is_project_member(project_id))
  );

create policy "Users can update own files"
  on public.office_files for update
  using (auth.uid() = user_id);

create policy "Users can delete own files"
  on public.office_files for delete
  using (auth.uid() = user_id);

drop policy if exists "Project members can view project files" on public.office_files;
drop policy if exists "Project members can update project files" on public.office_files;

create policy "Project members can view project files"
  on public.office_files for select
  using (project_id is not null and public.flow_is_project_member(project_id));

create policy "Project members can update project files"
  on public.office_files for update
  using (project_id is not null and public.flow_is_project_member(project_id))
  with check (project_id is not null and public.flow_is_project_member(project_id));

-- ── Auto-update updated_at on every write ─────────────────────────────────────
create or replace function public.update_office_files_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists office_files_updated_at on public.office_files;
create trigger office_files_updated_at
  before update on public.office_files
  for each row execute function public.update_office_files_updated_at();
