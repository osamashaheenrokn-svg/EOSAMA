-- Qimmat Al-Hadara contracting portal — full schema + RLS
-- Run this once in Supabase Dashboard → SQL Editor → New query → Run.

create extension if not exists pgcrypto;

-- ============================= TABLES =============================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('admin', 'engineer', 'custom', 'viewer')),
  treasury_access boolean not null default false,
  edit_access boolean not null default false,
  reports_access boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null default '—',
  duration text not null default '—',
  contract_value numeric not null default 0,
  progress int not null default 0 check (progress between 0 and 100),
  pending_billing numeric not null default 0,
  status text not null default 'جاري',
  engineer_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.project_team (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_type text not null check (role_type in ('engineer', 'accountant')),
  primary key (project_id, user_id)
);

create table public.updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  date date not null default current_date,
  text text not null,
  attachment_path text,
  created_at timestamptz not null default now()
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  caption text default '',
  attachment_path text,
  created_at timestamptz not null default now()
);

create table public.custody_received (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  number int not null,
  date date not null,
  amount numeric not null,
  attachment_path text,
  created_at timestamptz not null default now()
);

create table public.custody_spent (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  file_number int not null,
  week int not null,
  from_date date,
  to_date date,
  amount numeric not null,
  attachment_path text,
  created_at timestamptz not null default now()
);

create table public.labor_costs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  week int not null,
  from_date date,
  to_date date,
  count int not null,
  cost numeric not null,
  notes text default '',
  attachment_path text,
  created_at timestamptz not null default now()
);

create table public.labor_payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  payment_number int not null,
  date date not null,
  amount numeric not null,
  attachment_path text,
  created_at timestamptz not null default now()
);

create table public.salaries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  month text not null,
  name text not null,
  role text default '',
  amount numeric not null,
  notes text default '',
  attachment_path text,
  created_at timestamptz not null default now()
);

create table public.revenues (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  number int not null,
  date date not null default current_date,
  amount numeric not null,
  notes text default '',
  attachment_path text,
  created_at timestamptz not null default now()
);

create table public.subcontractors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  scope text default '',
  created_at timestamptz not null default now()
);

create table public.subcontractor_claims (
  id uuid primary key default gen_random_uuid(),
  subcontractor_id uuid not null references public.subcontractors (id) on delete cascade,
  number int not null,
  amount numeric not null,
  date date,
  attachment_path text,
  created_at timestamptz not null default now()
);

create table public.subcontractor_payments (
  id uuid primary key default gen_random_uuid(),
  subcontractor_id uuid not null references public.subcontractors (id) on delete cascade,
  number int not null,
  amount numeric not null,
  date date,
  attachment_path text,
  created_at timestamptz not null default now()
);

create table public.treasury (
  id smallint primary key default 1 check (id = 1),
  cash_custody_remaining numeric not null default 0,
  company_sheet_remaining numeric not null default 0,
  external_claims numeric not null default 0,
  override_capital_paid numeric,
  override_capital_returned numeric,
  override_net_profit numeric,
  updated_at timestamptz not null default now()
);
insert into public.treasury (id) values (1);

create table public.treasury_deposits (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  amount numeric not null,
  description text not null,
  from_import boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.treasury_withdrawals (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  amount numeric not null,
  notes text not null,
  from_import boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================= HELPER FUNCTIONS =============================
-- security definer so they can read profiles/projects regardless of the caller's own RLS visibility

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and kind = 'admin');
$$;

create or replace function public.get_membership(p_project_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select case
    when exists (select 1 from public.projects where id = p_project_id and engineer_id = auth.uid()) then 'engineer'
    else (select role_type from public.project_team where project_id = p_project_id and user_id = auth.uid())
  end;
$$;

create or replace function public.is_owner(p_project_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or public.get_membership(p_project_id) = 'engineer';
$$;

create or replace function public.can_access_limited(p_project_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_owner(p_project_id) or public.get_membership(p_project_id) = 'accountant';
$$;

create or replace function public.can_view_all_finance()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or coalesce((select reports_access from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.can_see_treasury()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or coalesce((select treasury_access from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.can_edit_delete()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or coalesce((select edit_access from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.sub_project_id(p_subcontractor_id uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select project_id from public.subcontractors where id = p_subcontractor_id;
$$;

-- ============================= RLS =============================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_team enable row level security;
alter table public.updates enable row level security;
alter table public.photos enable row level security;
alter table public.custody_received enable row level security;
alter table public.custody_spent enable row level security;
alter table public.labor_costs enable row level security;
alter table public.labor_payments enable row level security;
alter table public.salaries enable row level security;
alter table public.revenues enable row level security;
alter table public.subcontractors enable row level security;
alter table public.subcontractor_claims enable row level security;
alter table public.subcontractor_payments enable row level security;
alter table public.treasury enable row level security;
alter table public.treasury_deposits enable row level security;
alter table public.treasury_withdrawals enable row level security;

-- profiles: everyone signed in can see the roster (names/roles); only admin manages it
create policy "profiles_select_all" on public.profiles for select to authenticated using (true);
create policy "profiles_admin_write" on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- projects: everyone signed in can see all projects (viewer role); only owner/admin edits fields; admin manages lifecycle
create policy "projects_select_all" on public.projects for select to authenticated using (true);
create policy "projects_insert_admin" on public.projects for insert to authenticated with check (public.is_admin());
create policy "projects_update_owner" on public.projects for update to authenticated
  using (public.is_owner(id)) with check (public.is_owner(id));
create policy "projects_delete_admin" on public.projects for delete to authenticated using (public.is_admin());

-- project_team: visible to all signed-in users; only admin assigns
create policy "team_select_all" on public.project_team for select to authenticated using (true);
create policy "team_admin_write" on public.project_team for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- updates / photos: visible to all signed-in users; only project owner adds
create policy "updates_select_all" on public.updates for select to authenticated using (true);
create policy "updates_insert_owner" on public.updates for insert to authenticated with check (public.is_owner(project_id));
create policy "photos_select_all" on public.photos for select to authenticated using (true);
create policy "photos_insert_owner" on public.photos for insert to authenticated with check (public.is_owner(project_id));

-- custody (received/spent): owner + project accountant + reports_access can view; owner+accountant add; edit_access/admin edit&delete
create policy "custody_received_select" on public.custody_received for select to authenticated
  using (public.can_access_limited(project_id) or public.can_view_all_finance() or public.can_see_treasury());
create policy "custody_received_insert" on public.custody_received for insert to authenticated
  with check (public.can_access_limited(project_id));
create policy "custody_received_update" on public.custody_received for update to authenticated
  using (public.can_edit_delete()) with check (public.can_edit_delete());
create policy "custody_received_delete" on public.custody_received for delete to authenticated
  using (public.can_edit_delete());

create policy "custody_spent_select" on public.custody_spent for select to authenticated
  using (public.can_access_limited(project_id) or public.can_view_all_finance() or public.can_see_treasury());
create policy "custody_spent_insert" on public.custody_spent for insert to authenticated
  with check (public.can_access_limited(project_id));
create policy "custody_spent_update" on public.custody_spent for update to authenticated
  using (public.can_edit_delete()) with check (public.can_edit_delete());
create policy "custody_spent_delete" on public.custody_spent for delete to authenticated
  using (public.can_edit_delete());

-- labor (costs/payments): owner-only tab (no accountantOk in the original model) + reports_access can view
create policy "labor_costs_select" on public.labor_costs for select to authenticated
  using (public.is_owner(project_id) or public.can_view_all_finance() or public.can_see_treasury());
create policy "labor_costs_insert" on public.labor_costs for insert to authenticated
  with check (public.is_owner(project_id));
create policy "labor_costs_update" on public.labor_costs for update to authenticated
  using (public.can_edit_delete()) with check (public.can_edit_delete());
create policy "labor_costs_delete" on public.labor_costs for delete to authenticated
  using (public.can_edit_delete());

create policy "labor_payments_select" on public.labor_payments for select to authenticated
  using (public.is_owner(project_id) or public.can_view_all_finance() or public.can_see_treasury());
create policy "labor_payments_insert" on public.labor_payments for insert to authenticated
  with check (public.is_owner(project_id));
create policy "labor_payments_update" on public.labor_payments for update to authenticated
  using (public.can_edit_delete()) with check (public.can_edit_delete());
create policy "labor_payments_delete" on public.labor_payments for delete to authenticated
  using (public.can_edit_delete());

-- salaries / revenues: part of the "totals" tab (accountantOk) — owner+accountant view/add, reports_access view
create policy "salaries_select" on public.salaries for select to authenticated
  using (public.can_access_limited(project_id) or public.can_view_all_finance() or public.can_see_treasury());
create policy "salaries_insert" on public.salaries for insert to authenticated
  with check (public.is_owner(project_id));

create policy "revenues_select" on public.revenues for select to authenticated
  using (public.can_access_limited(project_id) or public.can_view_all_finance() or public.can_see_treasury());
create policy "revenues_insert" on public.revenues for insert to authenticated
  with check (public.can_access_limited(project_id));

-- subcontractors: same visibility as custody/totals
create policy "subcontractors_select" on public.subcontractors for select to authenticated
  using (public.can_access_limited(project_id) or public.can_view_all_finance() or public.can_see_treasury());
create policy "subcontractors_insert" on public.subcontractors for insert to authenticated
  with check (public.can_access_limited(project_id));
create policy "subcontractors_delete" on public.subcontractors for delete to authenticated
  using (public.can_edit_delete());

create policy "sub_claims_select" on public.subcontractor_claims for select to authenticated
  using (public.can_access_limited(public.sub_project_id(subcontractor_id)) or public.can_view_all_finance() or public.can_see_treasury());
create policy "sub_claims_insert" on public.subcontractor_claims for insert to authenticated
  with check (public.can_access_limited(public.sub_project_id(subcontractor_id)));
create policy "sub_claims_update" on public.subcontractor_claims for update to authenticated
  using (public.can_edit_delete()) with check (public.can_edit_delete());
create policy "sub_claims_delete" on public.subcontractor_claims for delete to authenticated
  using (public.can_edit_delete());

create policy "sub_payments_select" on public.subcontractor_payments for select to authenticated
  using (public.can_access_limited(public.sub_project_id(subcontractor_id)) or public.can_view_all_finance() or public.can_see_treasury());
create policy "sub_payments_insert" on public.subcontractor_payments for insert to authenticated
  with check (public.can_access_limited(public.sub_project_id(subcontractor_id)));
create policy "sub_payments_update" on public.subcontractor_payments for update to authenticated
  using (public.can_edit_delete()) with check (public.can_edit_delete());
create policy "sub_payments_delete" on public.subcontractor_payments for delete to authenticated
  using (public.can_edit_delete());

-- treasury: admin, or explicitly granted treasury_access — admin-only writes
create policy "treasury_select" on public.treasury for select to authenticated using (public.can_see_treasury());
create policy "treasury_update" on public.treasury for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "treasury_deposits_select" on public.treasury_deposits for select to authenticated using (public.can_see_treasury());
create policy "treasury_deposits_write" on public.treasury_deposits for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "treasury_withdrawals_select" on public.treasury_withdrawals for select to authenticated using (public.can_see_treasury());
create policy "treasury_withdrawals_write" on public.treasury_withdrawals for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ============================= STORAGE =============================
-- Private bucket for photos/attachments. Any signed-in user may read/upload —
-- the underlying data rows are already protected by the RLS policies above;
-- this bucket only stores the files those rows point to.

insert into storage.buckets (id, name, public) values ('attachments', 'attachments', false)
on conflict (id) do nothing;

create policy "attachments_read" on storage.objects for select to authenticated
  using (bucket_id = 'attachments');
create policy "attachments_write" on storage.objects for insert to authenticated
  with check (bucket_id = 'attachments');
create policy "attachments_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'attachments');

-- ============================= BOOTSTRAP =============================
-- After running this file:
-- 1. Supabase Dashboard → Authentication → Users → Add user (create yourself as admin).
-- 2. Copy that user's UUID, then run:
--    insert into public.profiles (id, name, kind) values ('<paste-uuid>', 'اسمك', 'admin');
