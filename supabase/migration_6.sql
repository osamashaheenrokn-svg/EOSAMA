-- Qimmat Al-Hadara portal — migration 6: company-assets permissions.
-- Run in Supabase Dashboard → SQL Editor → New query → Run (after migration_5.sql).
--
-- Two per-user keys in profiles.more_access control the "أصول الشركة" tab:
--   'assets'      → view only: see assets, tools and documents, open/download files.
--   'assetsEdit'  → view + add/edit assets, upload/replace/delete documents, manage tools.
-- Deleting a whole asset stays admin-only. Users with reports_access keep read access
-- (asset expiry dates feed their notifications bell).

alter table public.profiles add column if not exists more_access text[] not null default '{}';

-- to_jsonb(...) ? key works whether more_access is text[] or jsonb.
create or replace function public.has_more_access(p_key text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or coalesce(
    (select to_jsonb(more_access) ? p_key from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.can_edit_assets()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or public.has_more_access('assetsEdit');
$$;

create or replace function public.can_view_assets()
returns boolean language sql stable security definer set search_path = public as $$
  select public.can_edit_assets() or public.can_view_all_finance() or public.has_more_access('assets');
$$;

-- company_assets
drop policy if exists "assets_select" on public.company_assets;
drop policy if exists "assets_write_admin" on public.company_assets;
drop policy if exists "assets_update_admin" on public.company_assets;
drop policy if exists "assets_delete_admin" on public.company_assets;
create policy "assets_select" on public.company_assets for select to authenticated
  using (public.can_view_assets());
create policy "assets_insert" on public.company_assets for insert to authenticated
  with check (public.can_edit_assets());
create policy "assets_update" on public.company_assets for update to authenticated
  using (public.can_edit_assets()) with check (public.can_edit_assets());
create policy "assets_delete_admin" on public.company_assets for delete to authenticated
  using (public.is_admin());

-- asset_documents
drop policy if exists "asset_documents_admin_all" on public.asset_documents;
drop policy if exists "asset_documents_select" on public.asset_documents;
drop policy if exists "asset_documents_write" on public.asset_documents;
create policy "asset_documents_select" on public.asset_documents for select to authenticated
  using (public.can_view_assets());
create policy "asset_documents_write" on public.asset_documents for all to authenticated
  using (public.can_edit_assets()) with check (public.can_edit_assets());

-- company_tools (same tab)
drop policy if exists "tools_admin_all" on public.company_tools;
drop policy if exists "tools_select" on public.company_tools;
drop policy if exists "tools_write" on public.company_tools;
create policy "tools_select" on public.company_tools for select to authenticated
  using (public.can_view_assets());
create policy "tools_write" on public.company_tools for all to authenticated
  using (public.can_edit_assets()) with check (public.can_edit_assets());
