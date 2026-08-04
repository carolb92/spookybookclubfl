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
- **TanStack React Query** (`@tanstack/react-query`) for server-state caching and mutations; `QueryClient` configured in `App.tsx`, query keys centralized in `src/lib/queryKeys.ts`
- Path alias `@/` maps to `src/`

## Architecture

`App.tsx` renders `<Header>` above `<MainTabs>`. `MainTabs` hosts three Radix `Tabs` panels: **Now & Next**, **TBR**, **Read** — each a self-contained panel component under `src/components/<Tab>/`.

**Auth** uses Supabase magic link (OTP). Entry point is `AuthModal`, which gates interactive actions. The invite code is validated via a Supabase Edge Function (`validate_invite_code`) before sending the magic link. Auth service helpers live in `src/services/auth.ts`.

**Data** is fetched and mutated via **TanStack React Query** (`QueryClientProvider` set up in `App.tsx`, global `staleTime` of 5 minutes). Query keys for books are centralized in `src/lib/queryKeys.ts` (`bookKeys`), keyed by status (`bookKeys.byStatus(status)`), with `bookKeys.tbr(userId)` as the one per-user variant since TBR data includes each user's own vote. The actual Supabase calls (`queryFn`s and mutation bodies) still live inline in panel/component files rather than a separate data layer, except for shared write actions in `src/services/bookActions.ts`. `src/lib/database.types.ts` holds generated types.

**Cache invalidation convention:** a component that always acts on one known book status invalidates or patches the query cache itself, via `useQueryClient()` in its own mutation's `onSuccess` (e.g. `GhostRating`'s vote, `BookPreview`'s add-to-TBR). A component reused across multiple statuses with no way to know which one it's currently acting on (e.g. `DeleteBookDialog`, used for both TBR and Up Next books) instead calls a caller-supplied callback (`onDelete`, `onStatusChange`), and the parent — which does know the context — performs the invalidation. Both patterns are intentional; which one applies depends on whether the component knows its own status context, not on inconsistency.

## Design system

All custom tokens are CSS variables prefixed `--spooky-*` (e.g. `--spooky-crimson`, `--spooky-parchment`, `--spooky-border`, `--spooky-surface`, `--spooky-dust`). Reference them in Tailwind classes as `text-(--spooky-parchment)`, `bg-(--spooky-surface)`, etc. `font-display` maps to Playfair Display; `font-sans` maps to Geist.

## Environment variables

Required in `.env.local`:
```
VITE_PUBLIC_SUPABASE_URL=
VITE_PUBLIC_SUPABASE_ANON_KEY=
```
