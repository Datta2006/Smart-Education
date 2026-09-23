# Student OS — Auth & Configuration

## 1. Auth flow: there is none

Verified across the codebase — there is **no authentication, no sessions, no tokens, no user
accounts, and no cookies**:

- No auth library in `package.json` (no next-auth, no supabase-js, no firebase).
- No middleware file; no route guards beyond client-side redirects.
- "Login" is: the landing page's *demo student* button writes a hard-coded `StudentState` to
  localStorage (`components/landing/cta-buttons.tsx`) — or the user fills the onboarding form.
- "Logout" (`components/layout/app-shell.tsx` `handleLogout`) calls `resetStudent()` which just
  deletes the `sos_student_state` localStorage key, then routes to `/`.
- `NEXT_PUBLIC_APP_ENV=local` (`.env.example`) is defined but **never read by any code**.

### Consequences (flagged, not fixed)
- Every visitor is the same implicit "user" per browser. All data is device-local.
- `/admin/kb` (KB health dashboard + revalidate action) is linked in the main sidebar for
  everyone. Fine for a demo; must be gated before any shared deployment.

## 2. Environment variables

All env access goes through **one seam**: `lib/config/env.ts` (`getEnvConfig()` + singleton
`env`), except where noted. Reference file: `.env.example` (values intentionally omitted here).

| Variable | Read in | Purpose | Default behavior |
|---|---|---|---|
| `NEXT_PUBLIC_DEMO_MODE` | `lib/config/env.ts` | Forces demo mode when not `'false'` | `undefined` → demo mode ON |
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/config/env.ts` | Marks Supabase configured (with anon key) | absent → `hasSupabase=false` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/config/env.ts` | Together with URL → `hasSupabase` | absent → demo mode |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/config/env.ts` (stored on `env`, never used) | Reserved for future server adapters | unused |
| `AI_PROVIDER` | `lib/config/env.ts` (`aiProvider`), `lib/kb/llm.ts` (`isLlmEnabled`) | `'mock' \| 'gemini' \| 'openai'` | `'mock'` → extractive chat answers |
| `AI_API_KEY` | `lib/config/env.ts`, `lib/kb/llm.ts` | Enables grounded generation when provider ≠ mock | absent → no LLM calls |
| `AI_MODEL` | `lib/kb/llm.ts` | Model override | `gemini-1.5-flash` / `gpt-4o-mini` per provider |
| `KB_DEBUG` | `app/api/chat/route.ts`, `lib/kb/corpus.ts` | Any truthy value enables retrieval debug logs | unset → quiet |
| `NEXT_PUBLIC_APP_ENV` | ⚠️ **nothing** | Declared in `.env.example` only | dead variable |
| `DATABASE_URL` | `kb/ARCHITECTURE.md` (docs only) | For manually seeding the optional SQL schema | not read by app code |

**Demo-mode logic** (verbatim behavior from `env.ts`):
```ts
hasSupabase = Boolean(NEXT_PUBLIC_SUPABASE_URL && NEXT_PUBLIC_SUPABASE_ANON_KEY)
isDemoMode  = NEXT_PUBLIC_DEMO_MODE !== 'false' && !hasSupabase
hasAIProvider = aiProvider !== 'mock' && Boolean(AI_API_KEY)
```

**⚠️ Supabase contradiction:** `env.ts` and the factories treat "Supabase configured" as a
hard error (`getStudentRepository()` / `getEventLogger()` **throw**
`'Supabase…not implemented yet'`), while README/docs describe Supabase env vars as a migration
path. Setting those vars today would **crash the app at provider init** — don't.

## 3. Third-party services / external integrations

| Service | Where used | Keys? | Notes |
|---|---|---|---|
| **Google Search (scraped)** | `app/api/leetcode/search/route.ts` | **No key** — plain fetch with a Chrome UA | Resolves LeetCode URLs for course problems. Brittle; may hit CAPTCHA/ToS issues. |
| **OpenAI Chat Completions** | `lib/kb/llm.ts` `generateGrounded()` | `AI_API_KEY` when `AI_PROVIDER=openai` | Strict grounding system prompt; 20s timeout; falls back to extractive on error. Off by default. |
| **Gemini generateContent** | `lib/kb/llm.ts` | `AI_API_KEY` when `AI_PROVIDER=gemini` | Key passed as query param `?key=` (visible in server logs only; never client-side). Off by default. |
| **Google Fonts** | `app/layout.tsx` via `next/font/google` | none | Space Grotesk + JetBrains Mono, self-hosted at build time. |
| **pdf-parse** | `lib/kb/sources.ts` (dynamic import), offline build only | none | Extracts text from knowledge-base PDFs for the chat index. |
| **Supabase (planned)** | interfaces + factories only | none today | Schema lives in `kb/sql/`; no client ever talks to Supabase. |

## 4. Secrets hygiene

- `.env` exists locally (contains real values) and is **gitignored** (`.gitignore` covers
  `.env`, `.env.local`, `.env*.local`) ✅.
- `.env.example` ships placeholders only ✅.
- No secrets are hardcoded in source ✅ (grep of lib/, app/, components/ shows env reads only).
- ⚠️ `google.html` (a saved Google SERP page) and verbose server-side `console.log`s of search
  results (`app/api/leetcode/search/route.ts`) are dev leftovers worth removing before deploy.
