# Student OS — File Map

> Every source file, grouped by folder. ✅ = read in full during the docs scan.
> ⚠️ marks dead code / unused / suspicious (details in 07-KNOWN_ISSUES_AND_TODOS.md).

## app/ (routes & pages)

| File | Purpose & exports |
|---|---|
| ✅ `app/layout.tsx` | Root layout (server). Loads fonts (Space Grotesk, JetBrains Mono), loads + caches the KB via `loadKB()`, nests KBProvider → StudentProvider → TypingProvider → FocusProvider → CourseProvider. Exports `metadata`. Falls back to an **empty KB snapshot** on load failure. |
| ✅ `app/page.tsx` | Landing page (`'use client'`). Hero with scroll parallax, feature grid, "how it works", terminal mock. Uses `LandingCTAs`, `TiltCard`. |
| ✅ `app/onboarding/page.tsx` | Onboarding shell; redirects to `/dashboard` if a student already exists. Renders `OnboardingForm`. |
| ✅ `app/dashboard/page.tsx` | Main home page. Builds journey view + recommendations in `useMemo`; renders quick actions, phase progress bar, Today's Top 3, mentor insight, warnings, opportunities. Redirects to `/onboarding` when signed out. |
| ✅ `app/journey/page.tsx` | Phase timeline (completed/current/locked) with per-phase tasks & warnings; tasks link to `/tasks/[id]`. |
| ✅ `app/explore/page.tsx` | Browse all KB cards with type filter chips + text search; also shows course-track entry cards. |
| ✅ `app/decisions/page.tsx` | Accordion list of all `decision` cards; body rendered as plain text in a `<pre>`. |
| ✅ `app/mentor/page.tsx` | Chat page. Sidebar shows profile, relevant mentor notes (goal/year match), first 3 decision guides. Renders `ChatWindow`. |
| ✅ `app/typing/page.tsx` | Typing lab: difficulty selector, idle/running/done phases, live WPM/accuracy/time tiles, progress bar, collapsible history panel. |
| ✅ `app/focus/page.tsx` | Focus timer page with today/total minutes counters and recent-sessions list. |
| ✅ `app/profile/page.tsx` | Analytics hub: 6 typing stat cards, focus/course/streak strip, TypingChart (14-day WPM), difficulty breakdown bars, skills board, completed tasks, full-width ResumeBuilder. |
| ✅ `app/settings/page.tsx` | Edit name/weeklyHours/concerns; shows `env.aiProvider` info card; danger-zone reset (clears localStorage, routes to `/`). |
| ✅ `app/weekly-review/page.tsx` | Weekly completion %, anti-pattern triggers (`detectAntiPatternTriggers`), mentor feedback line, next-week suggestions. |
| ✅ `app/admin/kb/page.tsx` | Server component; `getKBReport()` → renders `AdminKBReport`. |
| ✅ `app/admin/kb/actions.ts` | `'use server'` — `revalidateAndFetch()`: clears KB cache then returns a fresh validation report. |
| ✅ `app/tasks/[id]/page.tsx` | Thin server wrapper → `TaskDetailClient`. |
| ✅ `app/cards/[id]/page.tsx` | Server component; `getCardById()` + 404 via `notFound()`; renders title + `Markdown` body. |
| ✅ `app/courses/page.tsx` | Course catalog home: overall progress, search across modules/questions/tags, DSA + System Design module grids, curated sheets cards. |
| ✅ `app/courses/dsa/[id]/page.tsx` | DSA module detail: checkable question rows (toggle → CourseProvider), difficulty badges, "To do" filter, LeetCode external-link flow via `/api/leetcode/search`. ⚠️ Calls `useMemo` after an early `return` (conditional hook — works in practice, fragile). |
| ✅ `app/courses/system-design/[id]/page.tsx` | System-design module detail: checkable topics with kind badges and key-idea lists. |
| ✅ `app/api/chat/route.ts` | `POST` chat endpoint (Node runtime). Greeting regex, message/history validation, retrieval, grounded-or-extractive answer, suggestions, corpus size. Exports `POST`. |
| ✅ `app/api/leetcode/search/route.ts` | `POST` — scrapes a Google SERP for `leetcode.com/problems/…` URLs, returns the first. ⚠️ Verbose console.log of raw results. |
| ✅ `app/globals.css` | Design tokens (CSS vars: base/panel/ink/accent #B4F34A/coral/sky/sun), keyframes, reduced-motion override, Jake's Resume print styles, `.no-print`/`.print-area` utilities. |

## components/

| File | Purpose & exports |
|---|---|
| ✅ `components/layout/app-shell.tsx` | Persistent sidebar (desktop) + drawer (mobile); nav array `NAV` (10 links), typing-stats widget, user chip, logout = `resetStudent()` + route `/`. Default export `AppShell`. |
| ✅ `components/ui/button.tsx` | `Button` — 7 variants (primary/accent/secondary/outline/ghost/danger/gradient), 4 sizes, optional `href` → renders a Next `Link`. ⚠️ `primary` variant references undefined `text-white-ink` token. |
| ✅ `components/ui/card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`. ⚠️ `CardFooter` never used outside its own file. |
| ✅ `components/ui/badge.tsx` | `Badge` — 8 variants, 3 sizes, rounded toggle. |
| ✅ `components/ui/input.tsx` | `Input` with label/error/hint/prefix/suffix icons; auto-generates id from label. |
| ✅ `components/ui/typography.tsx` | `Title`, `Body`, `Caption`, `Label`, `Code`, `Typography` namespace. ⚠️ Nothing imports these (only re-exported by `components/ui/index.ts`). |
| ✅ `components/ui/index.ts` | Barrel re-exports for the above. |
| ✅ `components/landing/cta-buttons.tsx` | `LandingCTAs`: "Test your typing" (magnetic button), "Start your journey", "try the demo student" — creates a hard-coded demo `StudentState` via `LocalStudentRepository` directly (bypasses provider). |
| ✅ `components/onboarding/onboarding-form.tsx` | 3-step RHF+Zod form. On submit: resolveSegment → setStudent → LocalEventLogger → full-page redirect. Exports default. |
| ✅ `components/task/task-detail-client.tsx` | Task detail with Markdown body and complete/undo toggle; logs `task_completed`/`task_skipped`. ⚠️ Early `return` before hooks… none after; OK but only by luck of ordering. |
| ✅ `components/kb/markdown.tsx` | `Markdown` — dependency-free mini renderer: h1–h3, ul/ol, bold/italic/code/links, blockquote, fences, hr. Used by cards, tasks, chatbot. |
| ✅ `components/chatbot/chat-window.tsx` | `ChatWindow` — message state, fetch to `/api/chat`, typing dots, source chips (score as %), suggestion chips, markdown answers. |
| ✅ `components/admin/kb-report.tsx` | `AdminKBReport` — counts grid, errors/warnings lists, "Re-validate KB" button calling the server action. ⚠️ Imports server action via a **relative path** `../../app/admin/kb/actions`. |
| ✅ `components/typing/typing-engine.tsx` | `TypingEngine` — hidden input capture, per-char coloring, caret, error shake, live stats callbacks, Esc-to-reset, consistency sampling. |
| ✅ `components/typing/result-view.tsx` | `ResultView` — animated result card with confetti, per-metric CountUps, performance copy, retry/next-level buttons. |
| ✅ `components/typing/history-panel.tsx` | `HistoryPanel` — stats tiles, last 12 tests, clear-history (with `confirm()`). |
| ✅ `components/focus/focus-timer.tsx` | `FocusTimer` — presets 50/25/10, SVG progress ring, pause/resume/reset, confetti on completion, `onComplete(minutes)`. |
| ✅ `components/profile/typing-chart.tsx` | `TypingChart` — hand-rolled SVG line/area chart with hover tooltips, animated path draw. |
| ✅ `components/profile/resume-builder.tsx` | `ResumeBuilder` — loads/saves resume, one-time legacy migration from `sos_resume_sections`, debounced save, edit/preview modes, print button. |
| ✅ `components/profile/resume-editor.tsx` | `ResumeEditor` — collapsible section editors (header/education/experience/projects/skills) with bullet list editors. |
| ✅ `components/profile/resume-one-pager.tsx` | `ResumeOnePager` — ATS-safe one-page render (uses `resume-*` CSS classes from globals.css). |
| ✅ `components/motion/spring-card.tsx` | `TiltCard` (3D pointer tilt), `SpringCard` (hover lift), `Magnetic` (cursor attraction). All reduced-motion aware. |
| ✅ `components/motion/count-up.tsx` | `CountUp` — rAF eased count animation; snaps to value on subsequent changes. |
| ✅ `components/motion/reveal.tsx` | `Reveal`, `Stagger`, `StaggerItem`, `PageFade`. ⚠️ `Reveal`/`Stagger`/`PageFade` have no importers (dead). |
| ✅ `components/motion/confetti.tsx` | `ConfettiBurst` — pure-CSS confetti using the `confetti-fall` keyframe. |

## providers/ (all client contexts)

| File | Purpose |
|---|---|
| ✅ `providers/kb-provider.tsx` | Read-only context for the server-loaded `KBSnapshot`; `useKB()` throws outside provider. |
| ✅ `providers/student-provider.tsx` | Student CRUD against the repository factory; `student`, `isLoading`, `setStudent`, `updateStudent`, `resetStudent`; `useStudent()`. |
| ✅ `providers/typing-provider.tsx` | Owns `sos_typing_data`; hydration flag, `addTest` (caps 500), derived `stats`; `useTyping()`. |
| ✅ `providers/focus-provider.tsx` | Owns `sos_focus_data`; `addSession` (caps 200), derived stats; `useFocus()`. |
| ✅ `providers/course-provider.tsx` | Owns `sos_course_progress_v1`; `toggle`, `done`, `overall` stats; `useCourses()`. |

## lib/

| File | Purpose & main exports |
|---|---|
| ✅ `lib/config/env.ts` | The single env seam: `getEnvConfig()` + singleton `env` (`isDemoMode`, `hasSupabase`, `hasAIProvider`, `aiProvider`, raw key values). |
| ✅ `lib/utils.ts` | `cn()` — clsx + tailwind-merge. |
| ✅ `lib/kb/schemas.ts` | Zod schemas for raw card frontmatter (`Raw*Schema`), `RawJourneySchema`, `KB_SCHEMA_VERSION='1'`. |
| ✅ `lib/kb/loader.ts` | **server-only**. Reads `content/kb/` with gray-matter, validates, normalizes (`anti_pattern`→`anti-pattern` etc.), derives `description`, caches singleton. Exports `loadKB()`, `revalidateKB()`, type `KBSnapshot`. |
| ✅ `lib/kb/registry.ts` | Server-side accessors over the snapshot: `getTaskById`, `getTasksByIds`, `getAntiPatternById`, `getDecisionGuides`, `getMentorNotes`, `getOpportunities`, `getJourneyForSegment`, `getJourneyByFilename`, `getAllKBCards`, `getCardById`, `getKBReport`, `revalidateKB`. ⚠️ Roughly half of these have no callers. |
| ✅ `lib/kb/validate.ts` | `validateKBSnapshot()` → `KBValidationReport` (duplicate ids, missing refs, type mismatches, orphan cards, missing frontmatter). |
| ✅ `lib/kb/vector-store.ts` | Hand-rolled embeddings: `hash32`, `tokenize`, `STOPWORDS`, `termFreq`, `buildIdfTable`, `embedText` (384-dim hashed TF-IDF + damped char trigrams), `quantize`/`dequantize`, `cosine`, `VectorStore`, `extractRelevant`, `EMBED_DIM=384`, `EMBED_VERSION=3`. |
| ✅ `lib/kb/chunker.ts` | `cleanText` (strips fences/links/resource tails), `splitSections`, `packBody` (900-char target, 2-line overlap), `chunkDoc`, `hashString`. |
| ✅ `lib/kb/sources.ts` | `collectSources()` — gathers card docs (≤6000 chars), subject notes (7 subject dirs), PDFs (≤60 via pdf-parse), allowlisted roadmap topics from `kb/knowledge-base/`. |
| ✅ `lib/kb/index-file.ts` | Persistence for `kb/index/kb-index.json`: `fingerprintSources`, `fingerprintsEqual`, `buildIndexFromChunks`, `writeIndex`, `readIndex`, `hydrateIndex`, `INDEX_FORMAT=1`. |
| ✅ `lib/kb/corpus.ts` | **server-only**. `getRetrievalIndex()` — cached load of the persisted index with in-memory fallback; `isIndexStale`, `corpusStats`. |
| ✅ `lib/kb/retrieval.ts` | `retrieve()` hybrid pipeline (follow-up detection, dense+BM25, RRF, rerank, evidence gate), `buildBm25`, `detectFollowUp`, `resolveQuery`, `confidenceOf`, `RETRIEVAL_CONFIG`. |
| ✅ `lib/kb/llm.ts` | `isLlmEnabled()`, `generateGrounded()` — OpenAI/Gemini chat calls under a strict grounding prompt; null when mock. |
| ✅ `lib/journey/segment-resolver.ts` | `resolveSegment()` — typed `SEGMENT_MAP` (btech-cse-1..4 → year-N-cse). |
| ✅ `lib/journey/journey-engine.ts` | `getJourneyView()` (phase status machine), `currentPhaseTasksDone()`, `buildCardsById()`. |
| ✅ `lib/recommendations/scoring.ts` | `SCORING_WEIGHTS`, `calculateRecommendationScore`, `detectAntiPatternTriggers` (5 hardcoded id-based rules), `matchingMentorNotes` (keyword `panic`/`anxiety` matching on `triggerCondition`). |
| ✅ `lib/recommendations/recommendation-engine.ts` | `generateRecommendations()` — tasks + warnings + opportunities with reasons built from phase data. ⚠️ Reasons hardcode "Year N **CSE** student". |
| ✅ `lib/student/student-repository.ts` | `StudentRepository` interface. |
| ✅ `lib/student/local-student-repository.ts` | `LocalStudentRepository` — localStorage key `sos_student_state`. |
| ✅ `lib/student/student-repository-factory.ts` | `getStudentRepository()` — throws if `hasSupabase`, else local. |
| ✅ `lib/student/student-schema.ts` | `StudentOnboardingSchema` (Zod), `StudentOnboardingValues`, `LEARNING_STYLE_OPTIONS`. |
| ✅ `lib/typing/types.ts` | `Difficulty`, `TypingTestResult`, `TypingSession`, `TypingStats`. |
| ✅ `lib/typing/generator.ts` | `generateText`, `DIFFICULTIES`, `DIFFICULTY_ORDER`, `nextDifficulty` — frequency-word generator with capital/digit/punct/tech-word mix per difficulty. |
| ✅ `lib/typing/storage.ts` | `loadTypingSession`, `saveTypingSession`, `computeStats`, `computeStreak`, `dailyWpmSeries` (14 days), `difficultyBreakdown`. |
| ✅ `lib/focus/types.ts` / `lib/focus/storage.ts` | `FocusSession/Data/Stats`; storage + `computeFocusStats`, `makeFocusSession`, `computeStreak` (⚠️ duplicated from typing/storage.ts). |
| ✅ `lib/courses/catalog.ts` | **GENERATED** (2080 lines). `COURSE_CATALOG` + question/topic/module/sheet interfaces. Do not hand-edit. |
| ✅ `lib/courses/progress.ts` | `CourseProgress`, key scheme `track:itemId`, `load/save/toggleItem/isCompleted/courseTotals/moduleStats/overallStats`. |
| ✅ `lib/resume/types.ts` | Jake's Resume model: `ResumeData` + item types, `makeId`, `emptyResume`. |
| ✅ `lib/resume/storage.ts` | `loadResume`/`saveResume` (`sos_resume_jake_v1`), `migrateLegacyResume`, `mergeWithDefaults`. |
| ✅ `lib/mentor/mentor-provider.ts` | `MentorProvider`, `MentorResponse` interfaces. ⚠️ Never called from any page/route. |
| ✅ `lib/mentor/mentor-context-builder.ts` | `buildMentorContext()`. ⚠️ No callers. |
| ✅ `lib/mentor/mentor-context-types.ts` | `MentorContext`. ⚠️ Only used by the unused mentor modules + AIProvider contract. |
| ✅ `lib/mentor/mock-mentor-provider.ts` | `MockMentorProvider` — keyword-matched deterministic answers referencing specific KB ids. ⚠️ No callers (the actual `/mentor` page uses the chatbot API instead). |
| ✅ `lib/mentor/mentor-provider-factory.ts` | `getMentorProvider()` — always returns mock. ⚠️ No callers. |
| ✅ `lib/ai/ai-provider.ts` | `AIProvider`/`AIProviderMessage` interfaces — contract for future adapters. ⚠️ No implementations. |
| ✅ `lib/events/event-logger.ts` | `EventType` (10 types), `EventLog`, `EventLogger` interface. |
| ✅ `lib/events/local-event-logger.ts` | `LocalEventLogger` — localStorage `sos_events`. ⚠️ Pages instantiate it **directly** instead of using the factory. |
| ✅ `lib/events/event-logger-factory.ts` | `getEventLogger()` — throws if Supabase configured. ⚠️ No callers. |

## types/

| File | Contents |
|---|---|
| ✅ `types/kb.ts` | `KBType`, `CardPriority`, `KBCard`, `JourneyPhase`, `JourneyFile`. |
| ✅ `types/student.ts` | `LearningStyle`, `AnalyticsData`, `StudentState`. |
| ✅ `types/journey.ts` | `JourneyPhaseView`, `JourneyView`. |
| ✅ `types/recommendation.ts` | `Recommendation`, `RecommendationResult`, action types. |
| ✅ `types/result.ts` | `Result<T,E>` discriminated union. |
| ✅ `types/pdf-parse.d.ts` | Ambient module for `pdf-parse` (devDependency used by scripts). |
| ⚠️ `types/serp.d.ts` | Ambient module for the `serp` npm package — **the package is never imported anywhere**. Dead type declaration for a dead dependency. |

## scripts/ & tests/

| File | Purpose |
|---|---|
| ✅ `scripts/build-kb-index.ts` | Offline chat-index builder (`npm run kb:build`): collect → chunk → IDF → embed → quantize → `kb/index/kb-index.json`; incremental via source fingerprints, `--force` flag. |
| ✅ `scripts/extract-courses.js` | One-off generator: parses `kb/sql/seed-*.sql` INSERTs → writes `lib/courses/catalog.ts`. |
| ✅ `tests/helpers/server-only-stub.ts` | Vitest alias target so `server-only` imports work in tests (empty file). |
| ✅ `tests/scoring.spec.ts` (6) | Weights, score accumulation, anti-pattern trigger rules. |
| ✅ `tests/journey-engine.spec.ts` (4) | Phase status machine, ordering, completion check. |
| ✅ `tests/segment-resolver.spec.ts` (4) | All 4 CSE segments, case-insensitivity, unknown-segment error. |
| ✅ `tests/recommendation-engine.spec.ts` (3) | Graceful degradation on missing refs, reason derivation, envelope. |
| ✅ `tests/kb-chunker.spec.ts` (7) | Cleaner + chunker behavior. |
| ✅ `tests/kb-retrieval.spec.ts` (7) | Index build/hydrate, fingerprints, ranking, follow-ups, gibberish rejection, confidence. |
| ✅ `tests/kb-validation.spec.ts` (3) | Healthy snapshot, missing refs, duplicate ids. |
| ✅ `tests/kb-integration.spec.ts` (4) | **Loads the real `content/kb`**: expects 29 tasks / 14 anti-patterns / 10 decisions / 15 mentor notes / 9 opportunities / 4 journeys, normalized types, zero missing references. |
| ✅ `tests/kb-interview-prep-cards.spec.ts` (7) | Validates the 22 `kb/cards` mirror + `seed-kb-cards.sql` sync. |

## Content & misc (not code, but read)

| Path | Purpose |
|---|---|
| `content/kb/` | 77 markdown cards (tasks/anti-patterns/decisions/mentor-notes/opportunities) + 4 journey JSONs (year-1..4-cse). Frontmatter ids occasionally differ from filenames (e.g. `survive-club-recruitment.md` → id `survive-club-recruitment-oop`). |
| `kb/sql/` | `schema.sql` (4 tables), `seed-dsa-questions.sql`, `seed-system-design.sql`, `seed-kb-cards.sql` (mirrors kb/cards, tested). |
| `kb/cards/` | 22 interview-prep cards, format-identical to content/kb; year-3 journey template. |
| `kb/ARCHITECTURE.md` | Documents the kb/ folder, provenance, seed instructions. |
| `kb/knowledge-base/` | Large study corpus (subjects, roadmaps, PDFs) — chatbot retrieval source. Gitignored, present locally. |
| `resources/` | Raw source material (`CS-Fundamentals-main`). Gitignored, excluded from tsconfig. |
| ⚠️ `google.html` | Saved obfuscated Google search-results page (dev artifact from building the SERP scrape). Dead weight — not referenced by anything. |
| `README.md` | Extensive, mostly accurate; docs supersede where they disagree. |
| `BRAINSTORM.md` | Pre-implementation build plan; still a good statement of intent. |
| `.claude/ .codex/ .impeccable/ .mimocode/` | Local tool/agent config; not app code. |
| `.DS_Store` | macOS artifact. |
