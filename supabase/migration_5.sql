-- Qimmat Al-Hadara portal — migration 5: equipment document slots.
-- Run in Supabase Dashboard → SQL Editor → New query → Run (after migration_4.sql).
-- Each asset (vehicle / equipment) card now has three document slots:
-- استمارة (registration), تأمين (insurance) and أخرى (other attachments).
-- Documents uploaded before this migration land in "أخرى".

alter table public.asset_documents
  add column if not exists category text not null default 'أخرى';

alter table public.asset_documents drop constraint if exists asset_documents_category_check;
alter table public.asset_documents
  add constraint asset_documents_category_check check (category in ('استمارة', 'تأمين', 'أخرى'));
