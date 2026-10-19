@AGENTS.md

# Project notes — بوابة قمة الحضارة (Qimmat Al-Hadara portal)

## Working with the owner
- Always reply in Arabic (Egyptian dialect is fine). The owner is not a developer: keep replies short, plain, step by step.
- Start working as soon as a change is requested. Read the code yourself; don't ask for files or context that is in the repo.
- Every delivery ends with:
  1. the Pull Request link (the owner presses Merge; Vercel deploys `main` automatically);
  2. if the database changed: a direct GitHub link to each new `supabase/migration_N.sql` file, plus
     https://supabase.com/dashboard/project/_/sql/new and the order to run them in.

## Code layout
- Next.js app (App Router) + Supabase. Real code: `app/`, `components/` (`views/`, `tabs/`), `lib/` (`db.js`, `attachments.js`, `supabase/`).
- The `.js` files at the repo root, `components/components/`, `page (1).js` and `qimmatportal.zip` are old copies — not used by the app. Don't edit them.
- `components/Dashboard.js` holds most state, data loading and handlers; views/tabs get them as props.
- Files go to the private Supabase Storage bucket `attachments` (helpers in `lib/attachments.js`).
- Checks before pushing: `npm ci`, `npx eslint components lib app`, `next build` (dummy `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` are enough). Delete `node_modules/` and `.next/` afterwards: the ignore file is named `gitignore` (no dot), so git does not use it.

## Database
- Schema: `supabase/schema.sql`, then `supabase/migration_2.sql`, root `migration_3.sql`, `supabase/migration_4.sql` … `migration_6.sql` (all already run on production).
- New DB changes go in the next `supabase/migration_N.sql` (next: 7). Make them safe to re-run (`if not exists`, `drop policy if exists`, `create or replace`).
- `profiles.more_access` (array of tab keys) exists in production but was added outside these files; `list_roster()` in production returns it. Don't redefine `list_roster()` without checking.
- Permissions: `profiles.kind` (`admin` / `engineer` / `custom` / `viewer`), flags `reports_access`, `treasury_access`, `edit_access`, and `more_access` keys (`company`, `needs`, `compare`, `assets`, `assetsEdit`, `staffDirectory`). RLS helpers: `is_admin()`, `is_owner()`, `can_access_limited()`, `can_view_all_finance()`, `has_more_access()`, `can_view_assets()`, `can_edit_assets()`.
- The owner may have more than one Supabase project; if SQL fails with "relation … does not exist", they are probably in the wrong project.
