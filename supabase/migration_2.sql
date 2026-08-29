-- Qimmat Al-Hadara portal — migration 2: timeline, documents, QA, ratings,
-- audit log, approvals, company assets/tools, leads, staff/payroll roster.
-- Run in Supabase Dashboard → SQL Editor → New query → Run (after schema.sql).
-- Note: this does not touch or drop the old `salaries` table — any salary
-- rows already entered through the site stay intact, just unused by the
-- app going forward (replaced by the staff/staff_payments tables below).

-- ============================= COLUMNS =============================

alter table public.projects add column if not exists map_lat double precision;
alter table public.projects add column if not exists map_lng double precision;

alter table public.subcontractors add column if not exists rating smallint default 0 check (rating between 0 and 5);

-- ============================= TABLES =============================

create table public.project_phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  planned_start date,
  planned_end date,
  actual_start date,
  actual_end date,
  created_at timestamptz not null default now()
);

create table public.project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  category text not null default 'أخرى',
  name text not null,
  attachment_path text,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.qa_checklist (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  phase text not null,
  item text not null,
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  actor_name text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create table public.company_settings (
  id smallint primary key default 1 check (id = 1),
  approval_threshold numeric not null default 20000,
  periodic_report_frequency text not null default 'weekly',
  periodic_report_method text not null default 'whatsapp',
  periodic_report_recipient text not null default ''
);
insert into public.company_settings (id) values (1);

create table public.pending_approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  type text not null,
  entry jsonb not null,
  amount numeric not null,
  requested_by uuid references public.profiles (id) on delete set null,
  requested_by_name text not null,
  requested_at timestamptz not null default now()
);

create table public.company_assets (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  number text not null,
  year_made int,
  license_expiry date,
  insurance_expiry date,
  created_at timestamptz not null default now()
);

create table public.asset_documents (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.company_assets (id) on delete cascade,
  name text not null,
  attachment_path text,
  created_at timestamptz not null default now()
);

create table public.company_tools (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  quantity int not null default 0,
  unit text default '',
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text default '',
  notes text default '',
  status text not null default 'تحت المتابعة' check (status in ('تحت المتابعة', 'تم الترسية', 'ملغي')),
  created_at timestamptz not null default now()
);

-- staff/payroll roster: persistent employees (engineers, supervisors, surveyors...)
-- charged to a project, with a fixed monthly salary and per-month payment tracking
-- (replaces the old one-off "salaries" log).
create table public.staff (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  role text default '',
  monthly_salary numeric not null,
  start_date date not null,
  created_at timestamptz not null default now()
);

create table public.staff_payments (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff (id) on delete cascade,
  month text not null, -- 'YYYY-MM'
  amount numeric not null,
  paid_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (staff_id, month)
);

create or replace function public.staff_project_id(p_staff_id uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select project_id from public.staff where id = p_staff_id;
$$;

-- ============================= RLS =============================

alter table public.project_phases enable row level security;
alter table public.project_documents enable row level security;
alter table public.qa_checklist enable row level security;
alter table public.audit_log enable row level security;
alter table public.company_settings enable row level security;
alter table public.pending_approvals enable row level security;
alter table public.company_assets enable row level security;
alter table public.asset_documents enable row level security;
alter table public.company_tools enable row level security;
alter table public.leads enable row level security;

-- timeline / documents / QA: visible to every signed-in user (like updates/photos); only the project owner edits
create policy "phases_select_all" on public.project_phases for select to authenticated using (true);
create policy "phases_write_owner" on public.project_phases for all to authenticated
  using (public.is_owner(project_id)) with check (public.is_owner(project_id));

create policy "documents_select_all" on public.project_documents for select to authenticated using (true);
create policy "documents_write_owner" on public.project_documents for all to authenticated
  using (public.is_owner(project_id)) with check (public.is_owner(project_id));

create policy "qa_select_all" on public.qa_checklist for select to authenticated using (true);
create policy "qa_write_owner" on public.qa_checklist for all to authenticated
  using (public.is_owner(project_id)) with check (public.is_owner(project_id));

-- subcontractor rating needs an update policy (claims/payments already covered)
create policy "subcontractors_update" on public.subcontractors for update to authenticated
  using (public.can_access_limited(project_id)) with check (public.can_access_limited(project_id));

-- audit log: any signed-in user logs their own actions; only admin reads
create policy "audit_select_admin" on public.audit_log for select to authenticated using (public.is_admin());
create policy "audit_insert_self" on public.audit_log for insert to authenticated
  with check (actor_id = auth.uid());

-- company settings: everyone can read (owners need the approval threshold); only admin writes
create policy "company_settings_select_all" on public.company_settings for select to authenticated using (true);
create policy "company_settings_update_admin" on public.company_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- pending approvals: requester (owner/accountant) can create; only admin sees and resolves
create policy "approvals_select_admin" on public.pending_approvals for select to authenticated using (public.is_admin());
create policy "approvals_insert_requester" on public.pending_approvals for insert to authenticated
  with check (public.can_access_limited(project_id));
create policy "approvals_delete_admin" on public.pending_approvals for delete to authenticated using (public.is_admin());

-- company assets: admin manages; reports_access users can also read (their expiry dates feed the notifications bell)
create policy "assets_select" on public.company_assets for select to authenticated
  using (public.is_admin() or public.can_view_all_finance());
create policy "assets_write_admin" on public.company_assets for insert to authenticated with check (public.is_admin());
create policy "assets_update_admin" on public.company_assets for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "assets_delete_admin" on public.company_assets for delete to authenticated using (public.is_admin());

create policy "asset_documents_admin_all" on public.asset_documents for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- tools / leads: admin only
create policy "tools_admin_all" on public.company_tools for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "leads_admin_all" on public.leads for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- staff / staff_payments: same visibility as custody/totals; only the project owner manages
alter table public.staff enable row level security;
alter table public.staff_payments enable row level security;

create policy "staff_select" on public.staff for select to authenticated
  using (public.can_access_limited(project_id) or public.can_view_all_finance() or public.can_see_treasury());
create policy "staff_write_owner" on public.staff for all to authenticated
  using (public.is_owner(project_id)) with check (public.is_owner(project_id));

create policy "staff_payments_select" on public.staff_payments for select to authenticated
  using (public.can_access_limited(public.staff_project_id(staff_id)) or public.can_view_all_finance() or public.can_see_treasury());
create policy "staff_payments_write_owner" on public.staff_payments for all to authenticated
  using (public.is_owner(public.staff_project_id(staff_id))) with check (public.is_owner(public.staff_project_id(staff_id)));
