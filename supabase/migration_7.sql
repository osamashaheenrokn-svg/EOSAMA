-- Qimmat Al-Hadara portal — migration 7: project drawings.
-- Run in Supabase Dashboard → SQL Editor → New query → Run (after migration_6.sql).
-- A separate list of engineering drawings per project (drawing number, name/description,
-- attached file of any type: PDF, image, DWG/DXF…). Same access as project documents:
-- every signed-in user can see them, only the project owner (admin / project engineer) edits.

create table if not exists public.project_drawings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  drawing_number text not null default '',
  title text not null,
  description text not null default '',
  file_name text,
  attachment_path text,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists project_drawings_project_id_idx on public.project_drawings (project_id);

alter table public.project_drawings enable row level security;

drop policy if exists "drawings_select_all" on public.project_drawings;
drop policy if exists "drawings_write_owner" on public.project_drawings;
create policy "drawings_select_all" on public.project_drawings for select to authenticated using (true);
create policy "drawings_write_owner" on public.project_drawings for all to authenticated
  using (public.is_owner(project_id)) with check (public.is_owner(project_id));
