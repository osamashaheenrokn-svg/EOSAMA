-- Qimmat Al-Hadara portal — migration 4: project archive flag.
-- Run in Supabase Dashboard → SQL Editor → New query → Run (after migration_3.sql).
-- Adds an "archived" flag so a finished project can be hidden from the main
-- grid without deleting its data. Deleting a project is unaffected by this
-- migration — it already only requires the existing admin-only
-- "projects_delete_admin" policy from schema.sql, enforced at the database
-- level regardless of what the frontend confirmation flow looks like.

alter table public.projects add column if not exists archived boolean not null default false;
