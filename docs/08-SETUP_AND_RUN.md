# Student OS — Setup & Run

> Every step below is reverse-engineered from actual files: `package.json` (scripts),
> `vitest.config.ts`, `tsconfig.json`, `postcss.config.js`, `.env.example`, `.gitignore`,
> `scripts/*`, `kb/ARCHITECTURE.md`. No assumed steps.

## Requirements

- **Node.js** 18+ (Next.js 14 requirement; no `engines` field is set in package.json)
- **npm** (the repo ships `package-lock.json`; use npm, not pnpm/yarn)
- macOS/Linux or WSL recommended (a KB task even says so — fitting)

## 1. Install

```bash
npm install
```

## 2. Configure environment

For the default **demo mode**, no env file is required at all. To be explicit:

```bash
cp .env.example .env.local   # or .env
```

`.env.example` contents (names only — see 05-AUTH_AND_CONFIG.md for what each does):

```bash
NEXT_PUBLIC_APP_ENV=local            # dead variable, never read
NEXT_PUBLIC_DEMO_MODE=true

NEXT_PUBLIC_SUPABASE_URL=            # leave EMPTY — see warning below
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # leave EMPTY
SUPABASE_SERVICE_ROLE_KEY=           # unused

# KB chat retrieval index
# KB_DEBUG=1 enables retrieval candidate logging in /api/chat

# Optional grounded generation for /api/chat (leave mock for 100% local)
AI_PROVIDER=mock
AI_API_KEY=
AI_MODEL=
```

> ⚠️ **Do not set the Supabase vars.** If both URL + anon key are present,
> `getStudentRepository()` throws `'SupabaseStudentRepository not implemented yet'` at provider
> init and the app will not boot (`lib/student/student-repository-factory.ts`).

Optional quality-of-life:
- `KB_DEBUG=1` → verbose retrieval candidate logs from `/api/chat` (route + corpus).

Optional real-LLM mode (not needed for any core feature):
```bash
AI_PROVIDER=openai   # or gemini
AI_API_KEY=<key>
AI_MODEL=gpt-4o-mini # or gemini-1.5-flash by default
```

## 3. Run locally

```bash
npm run dev          # next dev
# open http://localhost:3000
```

First-run flow: landing page → "try the demo student" (creates a hard-coded Year-1 CSE demo
profile in localStorage) **or** "Start your journey" (3-step onboarding form).

## 4. Build the chat retrieval index (recommended once, before heavy chatbot use)

The chat route prefers a persisted index; without it, it rebuilds in memory on first request
(slower, logs a warning). To build it:

```bash
npm run kb:build                       # incremental; skips when source fingerprints unchanged
npm run kb:build -- --force            # full rebuild
```

- Output: `kb/index/kb-index.json` (gitignored). Requires `kb/knowledge-base/` to exist for the
  full corpus; with it absent you still get an index over `content/kb/` cards (sources are read
  with `readdirSafe` guards — missing dirs are skipped, not fatal).
- `NODE_OPTIONS=--conditions=react-server` in the script satisfies the `server-only` import used
  by lib files when running outside Next.

## 5. Tests

```bash
npm test            # ⚠️ vitest WATCH mode — interactive
npx vitest run      # one-shot (use this for CI / unattended)
npm run test:ui     # vitest browser UI
```

- 9 spec files / 45 tests, all passing at scan time (verified: `vitest run` → 45/45 in ~1.8s).
- `tests/kb-integration.spec.ts` and `tests/kb-interview-prep-cards.spec.ts` read the **real**
  `content/kb/` and `kb/cards/` folders — content edits can break them (intentional).
- Config: `vitest.config.ts` — `environment: 'node'`, globals on, alias `@` → project root,
  alias `server-only` → `tests/helpers/server-only-stub.ts`.

## 6. Lint & typecheck

```bash
npm run lint          # next lint
npx tsc --noEmit      # typecheck (no npm script exists for this)
```

## 7. Production build & serve

```bash
npm run build         # next build
npm run start         # next start (serves the production build)
```

Nothing else is needed: the KB ships as static files in `content/kb/`, and the chat index (if
built) is read from disk at runtime. On read-only/serverless filesystems (e.g. Vercel), the
in-memory index fallback covers a missing `kb/index/kb-index.json`.

## 8. Optional: load the SQL knowledge base (not used by the app at runtime)

Only if you want the Postgres-backed catalog (per `kb/ARCHITECTURE.md` §5.2; seeds are
idempotent):

```bash
psql "$DATABASE_URL" -f kb/sql/schema.sql
psql "$DATABASE_URL" -f kb/sql/seed-dsa-questions.sql
psql "$DATABASE_URL" -f kb/sql/seed-system-design.sql
psql "$DATABASE_URL" -f kb/sql/seed-kb-cards.sql
```

The running app does **not** connect to this database; it exists as a content pipeline
(`scripts/extract-courses.js` reads the seed files to generate `lib/courses/catalog.ts`).

## 9. Regenerate the course catalog (only when seeds change)

```bash
node scripts/extract-courses.js
# rewrites lib/courses/catalog.ts — never hand-edit that file
```

## 10. Deploy

### Vercel (framework preset: Next.js)
1. Push the repo (note: `kb/knowledge-base/` and `resources/` are gitignored — the deployed
   chatbot corpus will only contain `content/kb/` cards unless you commit that folder or build
   the index into the image).
2. Import into Vercel; build command `npm run build` (default), output: default.
3. Env vars: for demo mode just `NEXT_PUBLIC_DEMO_MODE=true` (or set nothing).
4. Deploy. All API routes run on the Node runtime.

### Any Node host
```bash
npm run build && npm run start
```

### Docker / CI
No Dockerfile, CI config, or deploy scripts exist in the repo (verified by glob) — nothing to
reverse-engineer; add your own.

## Troubleshooting quick hits

| Symptom | Cause | Fix |
|---|---|---|
| App crashes at boot mentioning `SupabaseStudentRepository not implemented yet` | Supabase env vars set | Remove `NEXT_PUBLIC_SUPABASE_URL`/`_ANON_KEY` |
| Chat answers slowly on first message / logs "persisted index missing… Building in memory" | `kb/index/kb-index.json` absent or stale format | `npm run kb:build` |
| Chatbot knows only mentoring cards, not subject notes | `kb/knowledge-base/` not present locally (gitignored) | Restore that folder, then `npm run kb:build` |
| LeetCode button says "Could not find the LeetCode problem" | Google served a captcha/different HTML | Retry later; feature is a best-effort scrape |
| Tests fail on card counts | Content added/removed | Update the expected counts in `tests/kb-integration.spec.ts` / `kb-interview-prep-cards.spec.ts` — or revert the content change |
