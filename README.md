# Builder One Stop

A one-stop platform for builders. The first feature is **Launchpad**: a place for engineers to launch projects, upvote, comment and bookmark, with a daily leaderboard.

**Stack:** Next.js 16 (App Router, Cache Components) · shadcn/ui (Base UI) · Tailwind v4 · Neon Postgres · Drizzle ORM (node-postgres) · Clerk · Vercel

## Local setup

1. **Install:** `pnpm install`
2. **Neon** (Postgres): `neon login`, then `neon deploy`. This provisions what `neon.ts` declares and writes `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct) into `.env`.
3. **Clerk** (auth): `pnpm dlx clerk@latest auth login`, then `pnpm dlx clerk@latest env pull`. This writes the Clerk keys for the linked app.
   - To enable GitHub sign-in, turn on GitHub under **User & authentication → SSO connections** in the Clerk Dashboard.
4. **Database:** `pnpm db:migrate` applies `drizzle/` using the direct connection.
5. **Run:** `pnpm dev`, then open http://localhost:3000.

See `.env.example` for every variable.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` / `build` / `start` | Next.js |
| `pnpm typecheck` / `lint` | TypeScript, ESLint |
| `pnpm db:generate` | Create a migration after editing `src/db/schema/*` |
| `pnpm db:migrate` | Apply migrations (uses `DATABASE_URL_UNPOOLED`) |
| `pnpm db:studio` | Browse the database |

## Deploy to Vercel

1. Import the repo in Vercel, which uses Fluid compute by default.
2. Set `DATABASE_URL` (pooled), `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and the `NEXT_PUBLIC_CLERK_*_URL` values from `.env.example`.
   For production Clerk keys, run `pnpm dlx clerk@latest deploy --mode agent --domain <your-domain>` first.
3. Apply migrations to the production branch with `pnpm db:migrate`.

## Project layout

```
src/
  proxy.ts             Clerk middleware; protects /launch and /bookmarks
  app/                 routes: / (leaderboard), /launch, /p/[slug], /bookmarks, /sign-in, /sign-up
  components/launchpad project row, upvote/bookmark buttons, forms
  components/ui        shadcn components
  db/index.ts          Drizzle on a pg Pool with @vercel/functions attachDatabasePool
  db/schema            users.ts (local copy of Clerk users), launchpad.ts
  lib/session.ts       getCurrentUser / requireUser (Clerk auth() + local user row)
  lib/launchpad        queries (cached), actions (Server Actions), validation, cache tags
```

## Conventions

- **Identity is Clerk.** `user.id` is the Clerk user ID. The local row is created the first time a user is seen, so app tables can reference it. A Clerk webhook will be needed later to sync profile edits and deletions.
- **Cache Components is on.** Anything that reads auth, params, or searchParams renders inside `<Suspense>`. Reads are `"use cache"` functions tagged via `lib/launchpad/tags.ts`, and Server Actions call `updateTag` after writing.
- Server Actions re-check auth themselves. `proxy.ts` only guards page navigation.
- The leaderboard groups launches by **UTC** day.
