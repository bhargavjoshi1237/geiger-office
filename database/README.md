# Geiger Office Database

Geiger Office owns its file, folder, and sharing records. The schema is deployed to the shared Geiger Supabase database and may attach records to Geiger Flow projects through nullable `project_id` foreign keys.

## Fresh Install Order

Run the Flow core schema first so `flow_projects` and `flow_is_project_member(uuid)` exist, then run:

1. `init/folders.sql`
2. `init/files.sql`
3. `init/add-folder-id.sql`
4. `init/sharing.sql`
5. `init/project-link.sql`
6. `init/storage.sql`

`fix-rls.sql` is a targeted remediation script for older deployments. It is not required after a clean install.

## Project Scope

- `project_id IS NULL` represents personal or standalone Office data.
- Project-created files and folders store the selected Flow project ID.
- Shares inherit `project_id` from their file through a trigger.
- Flow project members may read and update project-scoped Office records.
- Native Office owner and explicit sharing policies continue to apply.
- Deleting a Flow project sets Office `project_id` to `NULL` so authored content is preserved.

For existing deployments, run `init/project-link.sql` before switching Flow queries from `flow_office_*` to `office_*`.
