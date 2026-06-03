-- ─────────────────────────────────────────────────────────────────────────────
-- Geiger Office — Add folder_id to office_files
-- Run this in your Supabase SQL editor after creating the folders table.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.office_files
  add column if not exists folder_id uuid references public.office_folders(id) on delete set null;

create index if not exists office_files_folder_idx
  on public.office_files (user_id, folder_id);
