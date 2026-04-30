# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server (Vite HMR)
npm run build     # tsc -b && vite build
npm run lint      # eslint
npm run preview   # preview production build
```

No test runner is configured.

## Stack

- **React 19** + TypeScript, bundled with **Vite 8**
- **Tailwind CSS v4** (configured via `@theme inline` in `index.css`, not `tailwind.config.js`)
- **ShadCN** components in `src/components/ui/` — add new ones with `npx shadcn add <component>`
- **Supabase** (`@supabase/supabase-js`) for database and auth; client at `src/lib/supabaseClient.ts`
- Path alias `@/` maps to `src/`

## Architecture

`App.tsx` renders `<Header>` above `<MainTabs>`. `MainTabs` hosts three Radix `Tabs` panels: **Now & Next**, **TBR**, **Read** — each a self-contained panel component under `src/components/<Tab>/`.

**Auth** uses Supabase magic link (OTP). Entry point is `AuthModal`, which gates interactive actions. The invite code is validated via a Supabase Edge Function (`validate_invite_code`) before sending the magic link. Auth service helpers live in `src/services/auth.ts`.

**Data** is fetched directly from Supabase inside panel components. `src/lib/database.types.ts` holds generated types.

## Design system

All custom tokens are CSS variables prefixed `--spooky-*` (e.g. `--spooky-crimson`, `--spooky-parchment`, `--spooky-border`, `--spooky-surface`, `--spooky-dust`). Reference them in Tailwind classes as `text-(--spooky-parchment)`, `bg-(--spooky-surface)`, etc. `font-display` maps to Playfair Display; `font-sans` maps to Geist.

## Environment variables

Required in `.env.local`:
```
VITE_PUBLIC_SUPABASE_URL=
VITE_PUBLIC_SUPABASE_ANON_KEY=
```
