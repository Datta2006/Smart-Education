# Student OS (SOS)

SOS is an AI-powered **personalized mentoring platform** for students that acts as a
**Student Digital Twin**. It reads a student's degree, branch, year, goals, skills,
available hours, and concerns, then tells them exactly what to focus on next.

> Core principle: **Understand the student before recommending anything.**

The MVP fully supports **B.Tech / CSE / Year 1** and runs in **demo mode** with zero
external configuration (no database, no AI API key).

## Features

- **Typing lab** (`/typing`) — a one-button typing test. Text is randomly generated at
  test time (not normal words) across four difficulties: `easy` (lowercase), `medium`
  (mixed case), `hard` (+ digits), `extreme` (+ special characters). Live WPM, accuracy
  and consistency during the run; every test is saved to `localStorage` and feeds your
  profile analytics.
- **Focus timer** (`/focus`) — 10/25/50-minute deep-work sessions with an animated
  progress ring; completed blocks are tracked and counted.
- **KB chatbot** (`/mentor`) — a real retrieval chatbot with **no external LLM**. It
  builds a local vector index over the knowledge base (hashed word + char-trigram
  embeddings, cosine similarity) and answers by retrieving + trimming the most relevant
  snippets, citing its sources. Runs fully on-device via `POST /api/chat`.
- **Profile / resume** (`/profile`) — an animated typing-speed chart (last 14 days), a
  per-difficulty breakdown, a skills board, a resume builder with live preview, and
  print / save-as-PDF via `window.print()`.
- **Personalized mentoring** — journey map, "Today's Top 3" recommendations, warnings,
  opportunities, and a deterministic KB-grounded mentor. No LLM in the decision loop.

---

## Stack

- **Next.js 14** (App Router) + **TypeScript** (strict)
- **Tailwind CSS** (custom dark design system: `base`/`panel`/`line`/`ink`/`accent`
  tokens, `Space Grotesk` + `JetBrains Mono` fonts)
- **Framer Motion** — springs, layout animations, scroll-reveal, count-ups, confetti
- **Zod** — validation for the Knowledge Base and student state
- **Server Components** hydrate a serialized KB into a client `KBProvider`
- **localStorage** persistence behind repository interfaces (Supabase-ready)
- **Vitest** for the pure domain layer

Run it with:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

---

## Demo mode

The app runs entirely on your device with zero configuration:

- `NEXT_PUBLIC_DEMO_MODE=true` (default, see `.env.example`)
- Student profile, completed tasks, saved opportunities, and events persist in `localStorage`
- The mentor is a **deterministic, KB-grounded mock provider** — no AI API key needed
- No Supabase account needed

If the KB folder exists it is read from disk. Any missing referenced KB file is surfaced as
a validation issue on **`/admin/kb`** — never silently, never a crash.

---

## Knowledge Base structure

The KB (under `content/kb/`) is the **single source of truth** for mentoring content. The
app loads, validates, and uses the KB dynamically; it never hardcodes advice in UI.

```
content/kb/
  tasks/            # concrete actions with steps + proof + time estimates
  anti-patterns/    # traps to avoid (type: anti_pattern)
  decisions/        # situational guides (type: decision)
  mentor-notes/     # trigger-conditioned advice (type: mentor_note)
  opportunities/    # programs to apply to (type: opportunity)
  journey/          # per-segment phase maps (year-<year>-<branch>.json)
```

Every markdown card carries YAML frontmatter, e.g. a task:

```yaml
---
id: setup-unix-dev-environment
type: task
title: Setup UNIX Dev Environment
degree: btech
branch: cse
year: 1
phase: month-1
goals: [software-internship, placements]
priority: high
estimatedHours: 8
difficulty: beginner
status: published
---
```

The journey JSON (`year-1-cse.json`) is a typed lookup of phases → card IDs:

```json
{
  "year": 1,
  "branch": "cse",
  "title": "Year 1: The Foundation",
  "phases": [
    {
      "phase_id": "phase-1",
      "title": "The Setup & Reality Check",
      "months": "1-2",
      "focus": "Environment, CGPA, and Logic Basics",
      "tasks": ["setup-unix-dev-environment", "..."],
      "warnings": ["polyglot-trap-year-1", "..."],
      "opportunities": ["early-tech-programs"]
    }
  ]
}
```

### How to add content

1. **Add a task** — create `content/kb/tasks/<id>.md` with the `type: task` frontmatter
   (id, title, goals, priority, `estimatedHours`) and the body sections
   (`## Objective`, `## Steps`, `## Proof`, `## Mentor Note`).
2. **Add an anti-pattern** — `content/kb/anti-patterns/<id>.md`, `type: anti_pattern`,
   sections `## Mistake` / `## Why It Hurts` / `## Better Action`.
3. **Add a decision guide** — `content/kb/decisions/<id>.md`, `type: decision`. The
   Decisions page renders the full body when opened.
4. **Add a mentor note** — `content/kb/mentor-notes/<id>.md`, `type: mentor_note`, plus a
   `trigger_condition` so scoring can decide when to surface it.
5. **Add an opportunity** — `content/kb/opportunities/<id>.md`, `type: opportunity`.
6. **Reference the new card** from the right phase(s) in `content/kb/journey/<segment>.json`.

Always keep card IDs globally unique — the loader ignores duplicates and `/admin/kb`
highlights them.

---

## How the recommendation engine works

`lib/recommendations/` is pure and deterministic — **no LLM in the decision loop.**

Each candidate (task, opportunity, warning) is scored against the student:

| Input                 | Weight  |
| --------------------- | ------- |
| Is in current phase   | 0.30    |
| Journey priority      | 0.25    |
| Goal fit              | 0.20    |
| Concern match         | 0.15    |
| Hours fit             | 0.10    |

All weights live in **one place**: `SCORING_WEIGHTS` in `lib/recommendations/scoring.ts`.

The engine then builds a `reason` derived from *actual* phase/task data — not a template,
e.g.:

> "Your current phase is 'The Setup & Reality Check (Environment, CGPA, and Logic Basics)'.
> Starting 'Setup UNIX Dev Environment' is a high-leverage next step for a Year 1 CSE student."

Anti-pattern triggers (tutorial hell, certificate hoarding, polyglot trap, AI/ML FOMO,
fake internships) are simple rule functions in `scoring.ts`, unit-tested in
`tests/scoring.spec.ts`.

---

## Architecture

Strict layered monolith. UI components contain **zero mentoring logic**.

```
UI (Server + Client components)
  ↑  reads
Application layer (providers, context builders)
  ↑  reads
Domain layer (journey engine, recommendation engine, scoring, segment resolver)
  ↑  reads
Data access layer (KB registry, repositories — behind interfaces)
  ↑  reads
Sources (KB files on disk · localStorage · later Supabase)
```

Key patterns:

- **KB hydration**: `app/layout.tsx` (server) loads + validates the KB once via
  `lib/kb/loader.ts` (cached singleton, `revalidateKB()` escape hatch) and passes the
  serialized snapshot into `KBProvider`. Client components consume it with `useKB()`.
- **Pure domain engines**: `(kbSnapshot, studentState) => result`. They run in `useMemo`
  on the client today; with Supabase they run server-side unchanged.
- **Errors are values**: `Result<T, E>` (see `types/result.ts`) is used for KB parsing,
  validation, segment resolution, and repository writes. Thrown exceptions only for
  programmer bugs.
- **Everything replaceable behind interfaces**:
  - Persistence: `StudentRepository`, `ProgressRepository`-style → `local-student-repository.ts`
  - Events: `EventLogger` → `local-event-logger.ts`
  - Mentor: `MentorProvider` → `MockMentorProvider`
  - AI: `AIProvider` (adapter contract only)

---

## How to migrate to Supabase

No re-write is required — the app *already* uses the same interfaces everywhere:

1. Implement `SupabaseStudentRepository` (and progress/events repos) against the
   `*Repository` interfaces.
2. Point the factories in `lib/config/env.ts` at them when
   `NEXT_PUBLIC_SUPABASE_URL` is set (missing keys → demo mode automatically).
3. `studentState` currently loads from `localStorage` in `StudentProvider`; swap that
   provider to fetch from your backend. The pure domain engines run identically.

Only the *providers/data sources* change — the engines never do.

---

## How to connect a real AI provider

1. Implement `AIProvider` (`lib/ai/ai-provider.ts`) for Gemini or OpenAI.
2. Implement `MentorProvider` on top of it (e.g. `GeminiMentorProvider`).
3. Return it from `lib/mentor/mentor-provider-factory.ts` when `AI_PROVIDER=gemini` etc.
4. Set `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL` in env.

The mock `MockMentorProvider` is grounded in KB content only and is the default.

---

## Project structure

```
app/            landing, onboarding, dashboard, journey, explore, typing, focus, mentor,
                profile, settings, weekly-review, admin/kb, tasks/[id], cards/[id],
                api/chat (vector retrieval endpoint)
components/     ui/ motion/ typing/ focus/ chatbot/ profile/ layout/ landing/ admin/
providers/      KBProvider (hydrated KB) + StudentProvider + TypingProvider (local state)
lib/typing      generator (random text per difficulty) + storage + stats
lib/kb          schemas → loader → registry + vector-store + corpus (server-side, cached)
lib/journey/    segment-resolver → journey-engine
lib/recommendations/ scoring + engine (pure)
lib/student/    repositories (interface + localStorage impl)
lib/mentor/     context builder + provider + mock
lib/events/     event logger
lib/config/     env.ts (single seam for capability flags)
types/          kb.ts student.ts journey.ts recommendation.ts result.ts
tests/          vitest for the pure domain (2024-08-08: 24 passing)
content/kb/     the mentor knowledge base (source of truth)
```

## Running tests

```bash
npm test          # vitest run
npm run test:ui   # vitest UI
```

## Deployment

### Vercel

1. Push to a GitHub repo.
2. Import into Vercel (framework preset: **Next.js**).
3. Build command `npm run build`, output dir default.
4. Add env vars from `.env.example` — for demo mode, just `NEXT_PUBLIC_DEMO_MODE=true`.
5. Deploy. The KB (markdown + JSON in `content/kb/`) deploys as static files;
   later a migration path switches it to a CMS/database-backed loader.

### Other hosts (Node)

```bash
npm run build
npm run start
```

---

## Roadmap → future adapters (structure-only)

- `SupabaseStudentRepository`, `SupabaseProgressRepository`, `SupabaseEventRepository`
- `GeminiMentorProvider`, `OpenAIMentorProvider`
- Segment mapping for MB B.Tech
- M.Tech / MBA / Diploma / other years as new journey files + `SEGMENT_MAP` rows