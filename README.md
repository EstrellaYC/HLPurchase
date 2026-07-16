# HL Purchase

Mobile-first PWA for restaurant inventory counting and daily procurement.

**Simple. Reliable. Mobile First. Restaurant Focus.**

## Stack

- React + TypeScript (strict)
- Vite + PWA
- Supabase (Auth, Postgres, Storage, RLS)
- TanStack Query + Zustand
- React Hook Form + Zod
- i18next (中文 / English)
- Netlify deploy

## Quick start

```bash
cp .env.example .env
# fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

npm install
npm run dev
```

## Supabase setup

1. Create a Supabase project.
2. Run migrations in order:
   - `supabase/migrations/202603150001_initial_schema.sql`
   - `supabase/migrations/202603150002_rls_policies.sql`
3. Create the first user in Auth, then set `profiles.role = 'owner'`.
4. Copy project URL + anon key into `.env`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript project build |
| `npm run preview` | Preview production build |

## Feature folders

```text
src/features/
  auth/
  users/
  categories/
  products/
  suppliers/
  inventory/
  procurement/
  invoices/
  excel/
  home/
```

## Deploy (Netlify)

- Build command: `npm run build`
- Publish directory: `dist`
- Add the same `VITE_SUPABASE_*` env vars in Netlify.

## Notes

- Detailed product PRD / `05-UI-UX-Guidelines.md` was not present in the repo at kickoff.
- UI follows the provisional guidelines in `docs/05-UI-UX-Guidelines.md` and the architecture rules in the project brief.
- Smart procurement algorithm is isolated in `src/features/procurement/smart/smart-procurement.algorithm.ts` for future replacement.
