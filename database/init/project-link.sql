-- Link existing Geiger Office data to Geiger Flow projects.
-- Run after the Flow core schema and the Office tables.

alter table public.office_folders
  add column if not exists project_id uuid;

alter table public.office_files
  add column if not exists project_id uuid;

alter table public.office_file_shares
  add column if not exists project_id uuid,
  add column if not exists shared_by uuid references auth.users(id) on delete set null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'office_folders_project_id_fkey'
      and conrelid = 'public.office_folders'::regclass
  ) then
    alter table public.office_folders
      add constraint office_folders_project_id_fkey
      foreign key (project_id) references public.flow_projects(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'office_files_project_id_fkey'
      and conrelid = 'public.office_files'::regclass
  ) then
    alter table public.office_files
      add constraint office_files_project_id_fkey
      foreign key (project_id) references public.flow_projects(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'office_file_shares_project_id_fkey'
      and conrelid = 'public.office_file_shares'::regclass
  ) then
    alter table public.office_file_shares
      add constraint office_file_shares_project_id_fkey
      foreign key (project_id) references public.flow_projects(id) on delete set null;
  end if;
end;
$$;

update public.office_files file
set project_id = folder.project_id
from public.office_folders folder
where file.folder_id = folder.id
  and file.project_id is null
  and folder.project_id is not null;

update public.office_file_shares share
set project_id = file.project_id,
    shared_by = coalesce(share.shared_by, file.user_id)
from public.office_files file
where share.file_id = file.id
  and (
    share.project_id is distinct from file.project_id
    or share.shared_by is null
  );

create index if not exists office_folders_project_idx
  on public.office_folders (project_id, updated_at desc);
create index if not exists office_files_project_updated_idx
  on public.office_files (project_id, trashed, updated_at desc);
create index if not exists office_file_shares_project_idx
  on public.office_file_shares (project_id, created_at desc);

create or replace function public.office_enforce_file_project()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  folder_project_id uuid;
begin
  if new.folder_id is null then
    return new;
  end if;

  select project_id into folder_project_id
  from public.office_folders
  where id = new.folder_id;

  if not found then
    raise exception 'Office folder % does not exist', new.folder_id;
  end if;

  if new.project_id is null and folder_project_id is not null then
    new.project_id = folder_project_id;
  elsif new.project_id is distinct from folder_project_id then
    raise exception 'Office file and folder must belong to the same project';
  end if;

  return new;
end;
$$;

drop trigger if exists office_files_project_scope on public.office_files;
create trigger office_files_project_scope
before insert or update of folder_id on public.office_files
for each row execute function public.office_enforce_file_project();

create or replace function public.office_sync_share_project()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  select file.project_id, coalesce(new.shared_by, file.user_id)
  into new.project_id, new.shared_by
  from public.office_files file
  where file.id = new.file_id;

  if not found then
    raise exception 'Office file % does not exist', new.file_id;
  end if;

  return new;
end;
$$;

drop trigger if exists office_file_shares_project_scope on public.office_file_shares;
create trigger office_file_shares_project_scope
before insert or update of file_id on public.office_file_shares
for each row execute function public.office_sync_share_project();

drop policy if exists "Users can create own folders" on public.office_folders;
create policy "Users can create own folders"
  on public.office_folders for insert
  with check (
    auth.uid() = user_id
    and (project_id is null or public.flow_is_project_member(project_id))
  );

drop policy if exists "Project members can view project folders" on public.office_folders;
drop policy if exists "Project members can update project folders" on public.office_folders;
create policy "Project members can view project folders"
  on public.office_folders for select
  using (project_id is not null and public.flow_is_project_member(project_id));
create policy "Project members can update project folders"
  on public.office_folders for update
  using (project_id is not null and public.flow_is_project_member(project_id))
  with check (project_id is not null and public.flow_is_project_member(project_id));

drop policy if exists "Users can create own files" on public.office_files;
create policy "Users can create own files"
  on public.office_files for insert
  with check (
    auth.uid() = user_id
    and (project_id is null or public.flow_is_project_member(project_id))
  );

drop policy if exists "Project members can view project files" on public.office_files;
drop policy if exists "Project members can update project files" on public.office_files;
create policy "Project members can view project files"
  on public.office_files for select
  using (project_id is not null and public.flow_is_project_member(project_id));
create policy "Project members can update project files"
  on public.office_files for update
  using (project_id is not null and public.flow_is_project_member(project_id))
  with check (project_id is not null and public.flow_is_project_member(project_id));

drop policy if exists "Project members view project shares" on public.office_file_shares;
create policy "Project members view project shares"
  on public.office_file_shares for select
  using (project_id is not null and public.flow_is_project_member(project_id));
