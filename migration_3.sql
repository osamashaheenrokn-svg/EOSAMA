-- Qimmat Al-Hadara portal — migration 3: tighten cross-project visibility
-- and lock down who can see other users' permission flags.
-- Run in Supabase Dashboard → SQL Editor → New query → Run (after migration_2.sql).

-- ============================= 1) Project-scoped visibility =============================
-- Previously updates/photos/timeline/documents/QA were visible to ANY signed-in user,
-- company-wide. Now they're restricted to that project's own team (owner + its
-- accountant) — same rule as the custody/financial tabs — plus anyone the admin has
-- explicitly granted "الاطّلاع على التقارير المالية لكل المشاريع" (reports_access).

drop policy if exists "updates_select_all" on public.updates;
create policy "updates_select_scoped" on public.updates for select to authenticated
  using (public.can_access_limited(project_id) or public.can_view_all_finance());

drop policy if exists "photos_select_all" on public.photos;
create policy "photos_select_scoped" on public.photos for select to authenticated
  using (public.can_access_limited(project_id) or public.can_view_all_finance());

drop policy if exists "phases_select_all" on public.project_phases;
create policy "phases_select_scoped" on public.project_phases for select to authenticated
  using (public.can_access_limited(project_id) or public.can_view_all_finance());

drop policy if exists "documents_select_all" on public.project_documents;
create policy "documents_select_scoped" on public.project_documents for select to authenticated
  using (public.can_access_limited(project_id) or public.can_view_all_finance());

drop policy if exists "qa_select_all" on public.qa_checklist;
create policy "qa_select_scoped" on public.qa_checklist for select to authenticated
  using (public.can_access_limited(project_id) or public.can_view_all_finance());

-- project_team rows (who's on which team) follow the same rule — no reason for an
-- unrelated user to see another project's staffing.
drop policy if exists "team_select_all" on public.project_team;
create policy "team_select_scoped" on public.project_team for select to authenticated
  using (public.can_access_limited(project_id) or public.can_view_all_finance() or public.is_admin());

-- ============================= 2) Lock down the user roster =============================
-- Only admin (or a user reading their own row) can read the profiles table directly —
-- this hides who has treasury/edit/reports access from everyone else. A safe RPC below
-- still gives every signed-in user the names/roles they need for names in the UI
-- (project owner, team members), with the permission flags always masked to false
-- unless the caller is admin.

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_self_or_admin" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

create or replace function public.list_roster()
returns table (
  id uuid, name text, kind text,
  treasury_access boolean, edit_access boolean, reports_access boolean,
  created_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select
    p.id, p.name, p.kind,
    case when public.is_admin() then p.treasury_access else false end,
    case when public.is_admin() then p.edit_access else false end,
    case when public.is_admin() then p.reports_access else false end,
    p.created_at
  from public.profiles p
  order by p.created_at;
$$;

grant execute on function public.list_roster() to authenticated;
