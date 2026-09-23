# Student OS (SOS) — Documentation Index

> **Plain-English summary:** Student OS is a personal mentoring platform for Indian engineering
> (B.Tech CSE) students. It asks who you are (degree, year, goals, skills, weekly hours,
> concerns), maps you onto a phase-by-phase 4-year "journey" built from a human-curated
> knowledge base of markdown cards, and then tells you exactly what to do next: daily task
> recommendations, anti-pattern warnings, opportunities, a phase-by-phase journey map, a
> retrieval-based chatbot that answers questions strictly from its own knowledge base (no
> external LLM needed), a typing-practice lab, a deep-work focus timer, a DSA/system-design
> course tracker (121 problems, 28 topics), and a printable one-page resume builder. Everything
> runs in **demo mode**: no database, no AI key, no login — all user data lives in the browser's
> `localStorage`, and the mentor content lives in `content/kb/` as markdown + JSON shipped with
> the app.

## Tech stack (verified from package.json / config files)

| Layer | Technology | Version | Evidence |
|---|---|---|---|
| Framework | Next.js (App Router) | **14.2.3** (pinned) | `package.json` |
| UI library | React / React DOM | ^18 | `package.json` |
| Language | TypeScript | ^5, `strict: true` | `package.json`, `tsconfig.json` |
| Styling | Tailwind CSS | ^3.4.1 (custom dark token system) | `tailwind.config.ts`, `app/globals.css` |
| Animation | Framer Motion | ^11.18.2 | `package.json` |
| Validation | Zod | ^3.23.8 | `package.json` (KB + onboarding schemas) |
| Forms | react-hook-form ^7.85.0 + @hookform/resolvers ^5.7.1 | | `components/onboarding/onboarding-form.tsx` |
| Markdown parsing | gray-matter | ^4.0.3 | `lib/kb/loader.ts` |
| Persistence | **localStorage** (demo mode); Supabase planned via repository interfaces | — | `lib/student/*`, `lib/config/env.ts` |
| Retrieval | Local hashed TF-IDF vectors + BM25 + RRF (hand-rolled, no ML libs) | — | `lib/kb/vector-store.ts`, `lib/kb/retrieval.ts` |
| Fonts | Space Grotesk (display) + JetBrains Mono (mono) via `next/font` | — | `app/layout.tsx` |
| Testing | Vitest | ^1.6.0 (9 spec files, 45 tests — all passing) | `vitest.config.ts`, `tests/` |
| Icons | lucide-react ^0.378.0 | | used on every page |

## Document map

| # | File | Purpose |
|---|------|---------|
| 00 | `00-INDEX.md` | This file — summary, stack, navigation |
| 01 | [01-ARCHITECTURE.md](01-ARCHITECTURE.md) | Architecture diagram, request flows, folder tree, key patterns |
| 02 | [02-FILE_MAP.md](02-FILE_MAP.md) | Every source file with one-line purpose + exports; dead code flagged |
| 03 | [03-DATA_MODELS.md](03-DATA_MODELS.md) | TypeScript models, localStorage shapes, KB frontmatter, SQL schema |
| 04 | [04-API_ROUTES.md](04-API_ROUTES.md) | Both API endpoints + the one server action |
| 05 | [05-AUTH_AND_CONFIG.md](05-AUTH_AND_CONFIG.md) | "Auth" (= none), env vars, third-party services |
| 06 | [06-DEPENDENCIES.md](06-DEPENDENCIES.md) | Dependencies grouped by purpose, unused ones flagged |
| 07 | [07-KNOWN_ISSUES_AND_TODOS.md](07-KNOWN_ISSUES_AND_TODOS.md) | Bugs, dead code, inconsistencies found while reading |
| 08 | [08-SETUP_AND_RUN.md](08-SETUP_AND_RUN.md) | Exact install/run/test/build/deploy steps from real config |

## How to use these docs (for future AI agents)

1. **Read this folder first.** These 9 files were written from a full file-by-file scan of the
   repository; they are the fastest route to understanding the app.
2. **Only open source files when you need to make or verify a specific change.** The file map
   (02) tells you exactly which file owns which behavior.
3. Note the two "sources of truth" for content: `content/kb/` (mentoring cards + journeys —
   loaded by the app at runtime) and `lib/courses/catalog.ts` (generated — do **not** hand-edit;
   regenerate via `node scripts/extract-courses.js` from `kb/sql/*.sql`).
4. If docs and code disagree, **the code wins** — but please flag it by updating the relevant
   doc in the same change.

## Quick orientation

- **No auth.** No login, no sessions, no user accounts. "Logout" in the shell just wipes localStorage.
- **No external database is contacted at runtime.** `kb/sql/` is a Supabase-ready schema used
  only as a content-generation source today.
- **The chatbot has no LLM by default** (`AI_PROVIDER=mock`): answers are extractive summaries
  of retrieved KB chunks. A grounded OpenAI/Gemini path exists behind env vars.
- **Two test surfaces:** unit tests for the pure domain layer (`npm test`) and content
  validation tests that read the actual `content/kb/` and `kb/cards/` folders.
