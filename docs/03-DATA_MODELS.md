# Student OS — Data Models

> This app has **no runtime database**. There are three data layers: TypeScript domain types,
> localStorage persistence shapes, and the on-disk Knowledge Base (markdown frontmatter + JSON,
> plus a Supabase-ready SQL schema used only for content generation today).

## 1. Core TypeScript models

### `StudentState` — types/student.ts (persisted)
The single user record. Everything personal lives here.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | `crypto.randomUUID()` at onboarding/demo creation |
| `name` | `string` | |
| `degree` / `branch` | `string` | e.g. `"B.Tech"`, `"CSE"` |
| `year` / `semester` | `number` | year 1–5, semester 1–10 (per Zod schema) |
| `goals` | `string[]` | kebab-case ids like `software-internship`, `placements` |
| `skills` / `interests` / `concerns` | `string[]` | |
| `weeklyHours` | `number` | 0–168 |
| `learningStyle` | `'visual' \| 'auditory' \| 'reading-writing' \| 'kinesthetic'` | |
| `completedTaskIds` | `string[]` | KB task ids |
| `savedOpportunityIds` / `dismissedWarningIds` | `string[]` | ⚠️ only read, never written by UI (see 07) |
| `journeyId` | `string` | e.g. `year-1-cse` — must match a journey JSON id |
| `currentPhaseId` | `string` | e.g. `phase-1` |
| `lastActiveAt` | `string` | ISO date |
| `analytics?` | `AnalyticsData` | Declared but **never populated** anywhere (see 07) |
| `resumeData?` | `Array<{section, content}>` | ⚠️ Legacy shape; superseded by the resume store, only read during legacy migration |

Sample record (the demo student created in `components/landing/cta-buttons.tsx`):
```json
{
  "id": "3f9c…", "name": "Demo Student", "degree": "B.Tech", "branch": "CSE",
  "year": 1, "semester": 1, "goals": ["software-internship", "placements"],
  "skills": ["programming"], "interests": [], "weeklyHours": 10,
  "learningStyle": "visual", "concerns": [], "completedTaskIds": [],
  "savedOpportunityIds": [], "dismissedWarningIds": [],
  "journeyId": "year-1-cse", "currentPhaseId": "phase-1",
  "lastActiveAt": "2026-09-24T00:00:00.000Z"
}
```

### `KBCard` — types/kb.ts (normalized at load time)
All five card types share this normalized shape (raw frontmatter differs — see §3).

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Globally unique slug |
| `type` | `'task' \| 'anti-pattern' \| 'decision' \| 'mentor-note' \| 'opportunity'` | Normalized from raw `anti_pattern`/`mentor_note` |
| `schemaVersion` | `string` | Defaults to `'1'` |
| `title`, `description`, `content` | `string` | `description` derived from first 180 chars of body; `content` = markdown body |
| `phase?` | `string` | Raw tag like `month-1` (⚠️ never used by journey logic — journeys own phases) |
| `degree`, `branch`, `year` | `string/string/number` | Defaults `''/''/0` when frontmatter omits them |
| `goals`, `tags` | `string[]` | |
| `priority` | `'high' \| 'medium' \| 'low'` | Default `'medium'` |
| `status` | `string` | Default `'draft'` (⚠️ never filtered on — draft cards would still render) |
| `estimatedHours?`, `difficulty?` | task-only | |
| `triggerCondition?` | mentor-note-only | From raw `trigger_condition` |

### `JourneyFile` / `JourneyPhase` — types/kb.ts
```ts
JourneyPhase { id, title, months, focus, tasks: string[], warnings: string[],
               decisions: string[], mentorNotes: string[], opportunities: string[] }
JourneyFile   { id /* filename minus .json */, schemaVersion, year, branch, title, phases: JourneyPhase[] }
```
Journey `id` comes from the **filename** (`year-1-cse.json` → `year-1-cse`); the JSON body has no id field.

### Recommendation & view models
- `Recommendation { id, title, reason, sourceKBIds, actionType: 'task'|'opportunity'|'warning'|'mentor-note', estimatedTime, priorityScore }`, `RecommendationResult { recommendations, generatedAt }` — types/recommendation.ts. Note `recommendation-engine.ts` only ever emits `task`, `warning`, `opportunity` — never `mentor-note`.
- `JourneyView { journey, phases: JourneyPhaseView[], currentPhaseIndex, nextPhaseId }`, `JourneyPhaseView` adds computed `status: 'completed'|'current'|'locked'` — types/journey.ts.
- `Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E }` — types/result.ts.

### Retrieval models — lib/kb/*
- `StoredDoc { id, title, path, content, kind: 'card'|'note'|'roadmap', section? }`
- `Chunk extends StoredDoc { part, sourceHash }` (chunker.ts)
- `IndexedDoc extends StoredDoc { vec: SparseVector }`, `SparseVector = Array<[dim, weight]>` over 384 dims, L2-normalized
- `KbIndexFile` (index-file.ts) — persisted shape: `{ format:1, embedVersion:3, embedDim:384, builtAt, stats, fingerprint, docFreq, totalDocs, chunks[] }` with int8-quantized vectors
- `RetrievalCandidate { doc, dense, bm25, rrf, rerank, breakdown }` (retrieval.ts)

## 2. localStorage shapes (per browser, no server)

| Key | Writer module | Shape | Caps |
|---|---|---|---|
| `sos_student_state` | lib/student/local-student-repository.ts | `StudentState` | — |
| `sos_typing_data` | lib/typing/storage.ts | `{ tests: TypingTestResult[] }`; `TypingTestResult { id, date, difficulty, wpm, raw, accuracy, consistency, durationMs, chars, errors }` | 500 tests |
| `sos_focus_data` | lib/focus/storage.ts | `{ sessions: FocusSession[] }`; `FocusSession { id, date, durationMin, completed }` | 200 sessions |
| `sos_course_progress_v1` | lib/courses/progress.ts | `{ completed: string[] /* "dsa:<qid>" \| "system-design:<tid>" */, updatedAt }` | — |
| `sos_resume_jake_v1` | lib/resume/storage.ts | `ResumeData { header{8 fields}, education[], experience[], projects[], skills{4 strings} }` | — |
| `sos_events` | lib/events/local-event-logger.ts | `EventLog { type, timestamp, metadata? }[]` (10 event types defined) | — |
| `sos_resume_sections` | (legacy) | `Array<{section, content}>` — migrated once by ResumeBuilder | — |

### `ResumeData` detail (lib/resume/types.ts)
```ts
header:   { name, headline, email, phone, location, linkedin, github, website }
education[]: { id, school, degree, grade, start, end }
experience[]: { id, company, role, start, end, location, bullets: string[] }
projects[]: { id, name, tech, link, bullets: string[] }
skills:   { languages, frameworks, tools, coursework }   // free-text strings
```

## 3. KB card frontmatter (raw, per type) — lib/kb/schemas.ts

All types share base fields: `id*`, `type*`, `title*`, `degree?`, `branch?`, `year?` (coerced),
`phase?`, `goals[]` (default `[]`), `priority?`, `status?`, `tags?`, `schemaVersion?`.

| Type (raw value) | Extra fields | Example file |
|---|---|---|
| `task` | `estimatedHours?` (coerced number), `difficulty?` | content/kb/tasks/setup-unix-dev-environment.md |
| `anti_pattern` | — | content/kb/anti-patterns/tutorial-hell-no-projects.md |
| `decision` | — | content/kb/decisions/cgpa-vs-projects-year-1.md |
| `mentor_note` | `trigger_condition?` | content/kb/mentor-notes/feeling-behind-in-year-1.md |
| `opportunity` | — | content/kb/opportunities/early-tech-programs.md |

Real sample (task, verbatim frontmatter):
```yaml
id: setup-unix-dev-environment
type: task
title: Setup UNIX Dev Environment & Portfolios
degree: btech
branch: cse
year: 1
phase: month-1
goals: [software-internship, placements, data-science]
skills: [programming, git]      # not in the Zod schema — ignored by loader
priority: high
estimated_hours: 8              # snake_case! schema expects estimatedHours
difficulty: beginner
status: published
```
⚠️ Known data quirk: several cards write `estimated_hours` (snake_case) while
`RawTaskSchema` expects `estimatedHours` — those cards then lose `estimatedHours` during
normalization (`normalizeCard` reads `(raw as RawTask).estimatedHours` → undefined). Cards also
write `skills:` frontmatter which no schema reads. See 07-KNOWN_ISSUES_AND_TODOS.md.

## 4. Course catalog (generated) — lib/courses/catalog.ts

Generated by `scripts/extract-courses.js` from `kb/sql/seed-dsa-questions.sql` +
`seed-system-design.sql`. Header says `generatedAt: 2026-09-14`, totals **121 DSA questions /
28 system-design topics / 3 sheets**.

```ts
CourseQuestion { id, title, category, difficulty: 'easy'|'medium'|'hard', source,
                 leetcodeNumber: number | null, tags: string[] }
CourseTopic    { id, title, kind: 'design-question' | 'concept', description, keyIdeas: string[] }
DsaModule      { id /* dsa-<category> */, title, kind: 'patterns' | 'dp', description,
                 questions[], easy, medium, hard, order }
SystemDesignModule { id: 'sd-concepts' | 'sd-designs', title, kind: 'concepts' | 'designs',
                 description, topics[], order }
DsaSheet       { id, title, source /* love-babbar-450 | grokking | striver-a2z */, description, topics[] }
CourseCatalog  { generatedAt, dsa: { total, modules }, systemDesign: { total, modules }, sheets }
```

## 5. SQL schema (Supabase-ready, not wired to runtime) — kb/sql/schema.sql

Four tables, all slug-id'd, `TEXT[]` arrays, `TIMESTAMPTZ` timestamps, CHECK constraints:

| Table | Key columns | Used by |
|---|---|---|
| `kb_cards` | id PK, type CHECK(task/anti_pattern/decision/mentor_note/opportunity), title, content, `content_source` (path to markdown), degree/branch/year/phase, goals/tags TEXT[], priority CHECK, status, estimated_hours, difficulty, trigger_condition | Mirrors card metadata; `tests/kb-interview-prep-cards.spec.ts` asserts seed ↔ markdown sync |
| `dsa_questions` | id PK, title, category, difficulty CHECK, source, leetcode_number, tags TEXT[], problem_statement, approach, time/space_complexity, solution_code, language (default 'python'), source_ref | Source of `catalog.ts` via extract script |
| `system_design_topics` | id PK, title, kind CHECK(design-question/concept), description, key_ideas TEXT, source | Source of `catalog.ts` |
| `dsa_sheets` | id PK, title, source, description, topics TEXT[] | Rendered as info cards only |

Relations: none enforced (no foreign keys). `kb_cards.content_source` is a soft link to a
markdown path. Seeds are idempotent (`ON CONFLICT (id) DO NOTHING`).

## 6. Chat index file — kb/index/kb-index.json (gitignored, built)

```jsonc
{
  "format": 1, "embedVersion": 3, "embedDim": 384,
  "builtAt": "…", "stats": { "sources": 0, "chunks": 0, "buildMs": 0 },
  "fingerprint": { "files": { "content/kb/tasks/x.md": "size:mtimeMs" } },
  "docFreq": { "term": docCount }, "totalDocs": 0,
  "chunks": [ { "id": "note:dsa/x.md#0", "title", "path", "kind": "note",
                "section", "part", "sourceHash", "content", "vec": [[dim, int8], …] } ]
}
```
A `readIndex()` rejecting on format/embedVersion/embedDim mismatch triggers the in-memory
fallback rebuild (dev convenience, logs a warning).
