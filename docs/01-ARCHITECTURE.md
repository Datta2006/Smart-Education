# Student OS — Architecture

> All claims below verified by reading the files cited. Diagrams are simplified but accurate.

## 1. Big picture

```
┌────────────────────────────── BROWSER (all user state lives here) ─────────────────────────────┐
│                                                                                                │
│  app/* pages (Server Components where marked, otherwise 'use client')                          │
│      │                                                                                         │
│      ▼                                                                                         │
│  app/layout.tsx (SERVER) ── loadKB() ──► lib/kb/loader.ts ── reads content/kb/*.md + *.json    │
│      │  serializes KBSnapshot into <KBProvider initialValue> (client)                          │
│      ▼                                                                                         │
│  providers/ (client context, each owning its own localStorage key)                             │
│    KBProvider · StudentProvider · TypingProvider · FocusProvider · CourseProvider              │
│      │                                                                                         │
│      ▼                                                                                         │
│  Pure domain engines (run in useMemo on the client)                                            │
│    lib/journey/journey-engine.ts · lib/recommendations/{engine,scoring}.ts                     │
│      │                                                                                         │
│      ▼                                                                                         │
│  localStorage keys: sos_student_state · sos_typing_data · sos_focus_data ·                     │
│                     sos_course_progress_v1 · sos_resume_jake_v1 · sos_events                   │
│                                                                                                │
│  POST /api/chat ─────────────┐        POST /api/leetcode/search ──────────────┐                │
└──────────────────────────────┼─────────────────────────────────────────────────┼────────────────┘
                               ▼                                                 ▼
┌────────────────────── NEXT.JS SERVER (Node runtime) ───────────────────────────────────────────┐
│  app/api/chat/route.ts                                                         (nodejs)        │
│    └► lib/kb/corpus.ts  ── kb/index/kb-index.json (persisted index, built by `npm run kb:build`)│
│         (fallback: rebuild in memory from content/kb + kb/knowledge-base via lib/kb/sources.ts) │
│    └► lib/kb/retrieval.ts  hybrid retrieval: dense cosine + BM25 → RRF → rerank → top 5 chunks  │
│    └► lib/kb/llm.ts        grounded OpenAI/Gemini IF env configured, else extractive answer     │
│                                                                                                │
│  app/api/leetcode/search/route.ts ──► fetch("https://www.google.com/search?q=…") (scrape)      │
│                                                                                                │
│  app/admin/kb/actions.ts ('use server') ──► lib/kb/registry.ts → loadKB() + validate.ts         │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
                               ▼
┌── CONTENT ON DISK ─────────────────────────────────────────────────────────────────────────────┐
│ content/kb/        markdown cards + journey JSON  → KBProvider (runtime mentoring content)     │
│ kb/knowledge-base/ subject notes, roadmaps, PDFs → retrieval index corpus (chatbot only)       │
│ kb/sql/            Postgres DDL + seeds           → scripts/extract-courses.js → catalog.ts    │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 2. Breakdown

| Tier | What exists | Files |
|---|---|---|
| **Frontend** | Next.js 14 App Router. 18 pages. Most pages are `'use client'`; only `app/layout.tsx`, `app/admin/kb/page.tsx`, `app/cards/[id]/page.tsx`, `app/tasks/[id]/page.tsx` (thin wrapper) are server-rendered. Dark design system in `app/globals.css` + `tailwind.config.ts`. Framer Motion everywhere with `prefers-reduced-motion` honored. | `app/`, `components/`, `providers/` |
| **Backend** | Exactly 2 API route handlers + 1 server action (see 04-API_ROUTES.md). Everything else is either a client component or a server-only library. | `app/api/`, `app/admin/kb/actions.ts` |
| **Database** | **None at runtime.** Persistence is localStorage behind the `StudentRepository` interface. A Supabase-ready Postgres schema exists at `kb/sql/schema.sql` but is used only as seed data for course generation; `student-repository-factory.ts` throws if `hasSupabase` is true because no adapter is implemented. | `lib/student/`, `kb/sql/` |
| **External services** | 1) Google Search scraped server-side (LeetCode URL lookup, no API key, no rate limit — fragile). 2) OpenAI/Gemini chat completions *only if* `AI_PROVIDER` + `AI_API_KEY` are set (default off). Google Fonts via `next/font` at build time. | `app/api/leetcode/search/route.ts`, `lib/kb/llm.ts`, `app/layout.tsx` |

## 3. Request flows

### A. First page load (`/dashboard`)
1. Browser → Next.js matches `app/dashboard/page.tsx`. `app/layout.tsx` (server) runs first and
   calls `loadKB()` (`lib/kb/loader.ts`), which reads + Zod-validates all of `content/kb/` and
   caches it in a module singleton (`cache`). On failure it returns an **empty snapshot** instead
   of crashing (`getKBData` in layout.tsx).
2. Layout serializes the `KBSnapshot` into `<KBProvider initialValue>` — client components get
   the KB for free; no KB fetch ever happens from the client.
3. `Dashboard` (client) reads `useStudent()`; while loading it shows a spinner. If no student →
   redirect `/onboarding`.
4. `useMemo` runs `buildCardsById` + `getJourneyView` (journey-engine) + `generateRecommendations`
   (recommendation-engine) + `matchingMentorNotes` (scoring). All pure functions of
   `(KBSnapshot, StudentState)`.
5. Renders quick actions, phase progress, Today's Top 3, mentor insight, warnings, opportunities.

### B. Onboarding
`app/onboarding/page.tsx` → `OnboardingForm` (react-hook-form + `zodResolver(StudentOnboardingSchema)`,
3 steps) → `resolveSegment({degree,branch,year})` maps e.g. `btech-cse-1` → journey id `year-1-cse`
(`lib/journey/segment-resolver.ts`, hardcoded `SEGMENT_MAP`) → `setStudent()` writes to
localStorage via `LocalStudentRepository` → logs `onboarding_completed` event → `window.location.href`
= `/dashboard` (full reload, not router.push).

### C. KB chat (`/mentor`)
1. `ChatWindow` (client) POSTs `{message, history}` → `/api/chat`.
2. Route gets the cached `RetrievalIndex` (`lib/kb/corpus.ts`): prefers the persisted index at
   `kb/index/kb-index.json` (built offline by `npm run kb:build`), else logs a warning and builds
   in memory from `collectSources()` (cards + subject notes + allowlisted roadmaps).
3. `retrieve()` (`lib/kb/retrieval.ts`): follow-up detection → effective query (folds in last 2 user
   messages + last bot answer) → dense hashed-TF-IDF cosine + BM25 candidates → Reciprocal Rank
   Fusion → transparent rerank (title/section hits, coverage, phrase, kind boost) → evidence gate →
   top ≤5 chunks.
4. Answer: `generateGrounded()` if a real provider is configured (strict "answer only from chunks,
   cite [n]" system prompt), otherwise `buildExtractiveAnswer()` stitches snippet excerpts with
   `[n]` markers. Greetings short-circuit; zero confident matches returns a "rephrase" message.
5. Response: `{answer, sources[{title,path,kind,section,score,ref}], suggestions, corpusSize}`.
   Client renders through the shared `Markdown` renderer with source chips.

### D. LeetCode lookup (course pages)
`app/courses/dsa/[id]/page.tsx` → external-link button POSTs `{topic}` to `/api/leetcode/search`
→ server fetches a real Google SERP with a desktop Chrome User-Agent, regex-extracts
`leetcode.com/problems/<slug>` URLs, returns the first hit; client opens it in a pre-opened tab
(popup fallback with `alert()`).

### E. Typing test
`app/typing/page.tsx` (idle/running/done phases) → `TypingEngine` generates text client-side from
frequency word lists (`lib/typing/generator.ts`), tracks live WPM/accuracy via ref-based sampling,
calls `onComplete` → `TypingProvider.addTest` prepends to `sos_typing_data` (capped at 500 tests)
→ profile page reads `dailyWpmSeries`/`difficultyBreakdown` from `lib/typing/storage.ts`.

## 4. Folder structure (one line each)

```
app/                     Next.js App Router: pages + 2 API routes + 1 server action
  admin/kb/              KB health dashboard (server page + 'use server' revalidate action)
  api/chat/              Retrieval chatbot endpoint (Node runtime)
  api/leetcode/search/   Google-SERP scrape → first leetcode.com/problems URL
  cards/[id]/            Server-rendered generic card detail (any KB type)
  courses/               Course tracker + dsa/[id] + system-design/[id] module pages
  dashboard/             Home: phase progress, Top 3, warnings, opportunities
  decisions/             Accordion list of decision-guide cards
  explore/               Searchable/filterable listing of all KB cards + course entry links
  focus/                 Deep-work timer page
  journey/               Timeline of the student's journey phases
  mentor/                Chat page (ChatWindow + profile/notes/decisions sidebar)
  onboarding/            3-step student profile form
  profile/               Analytics + skills + resume builder
  settings/              Edit name/hours/concerns, AI provider info, danger-zone reset
  tasks/[id]/            Task detail wrapper → TaskDetailClient (mark complete/undo)
  typing/                Typing lab (difficulty select, engine, results, history)
  weekly-review/         Deterministic weekly completion review
  layout.tsx             ROOT: fonts, provider nesting, server-side KB hydration
  page.tsx               Landing page (client)
  globals.css            Design tokens, keyframes, resume print styles
components/              UI building blocks (see 02-FILE_MAP.md)
  ui/                    Button/Card/Badge/Input/Typography primitives
  layout/                AppShell: persistent sidebar nav + mobile drawer
  motion/                TiltCard/SpringCard/Magnetic, CountUp, Reveal/Stagger, ConfettiBurst
  typing/ focus/         Feature components for the two labs
  chatbot/ kb/ profile/ task/ onboarding/ admin/ landing/   Feature components
providers/               5 client contexts (KB, Student, Typing, Focus, Course)
lib/                     Pure domain + data access (no React in most of it)
  kb/                    schemas→loader→registry (app KB) + chunker→vector-store→retrieval→
                         llm (chatbot corpus). loader.ts & corpus.ts are 'server-only'.
  journey/               segment-resolver (SEGMENT_MAP), journey-engine (pure)
  recommendations/       scoring (weights + anti-pattern rules), recommendation-engine (pure)
  student/               StudentRepository interface, localStorage impl, factory, onboarding schema
  typing/ focus/         Types, generators, storage, stats for the two labs
  courses/               catalog.ts (GENERATED) + progress.ts (localStorage toggle logic)
  resume/                Jake's Resume data model, storage, legacy migration
  mentor/                MentorProvider interface + context builder + mock (⚠ unused by UI)
  events/                EventLogger interface + localStorage impl + factory
  ai/                    AIProvider interface (contract only, no impl)
  config/                env.ts — the single seam reading process.env
  utils.ts               cn() class merge helper
types/                   Shared TS types: kb, student, journey, recommendation, result;
                         ambient module decls for pdf-parse and serp
scripts/                 build-kb-index.ts (npm run kb:build), extract-courses.js (catalog gen)
tests/                   9 Vitest spec files (45 tests) — pure domain + real-content validation
content/kb/              ⭐ runtime mentoring content: 77 cards + 4 journey JSONs
kb/                      Interview-prep KB: sql/ (DDL+seeds), cards/ (22 cards mirror),
                         knowledge-base/ (large study corpus, gitignored), ARCHITECTURE.md
resources/               Raw source material (gitignored, excluded from tsconfig)
docs/                    This documentation
```

## 5. Key patterns (all intentional, per README + code)

- **Strict layering**: UI contains zero mentoring logic; engines are pure.
- **KB hydration once on the server**, cached singleton, `revalidateKB()` escape hatch.
- **Errors are values**: `Result<T,E>` everywhere in lib; exceptions only for programmer bugs.
- **Everything behind interfaces**: `StudentRepository`, `EventLogger`, `MentorProvider`,
  `AIProvider` — with factories that currently only return the local/mock impl.
- **Two separate caches**: `lib/kb/loader.ts` cache (app KB, invalidate via server action) and
  `lib/kb/corpus.ts` cache (chat index, process-lifetime, no invalidation).
