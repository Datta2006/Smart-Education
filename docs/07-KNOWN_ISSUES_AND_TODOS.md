# Student OS — Known Issues & TODOs

> Methodology: every source file was opened and read during the docs scan; a repo-wide grep for
> TODO/FIXME/HACK/XXX/@deprecated returned **zero matches in application code** (the only hits
> were the word "hackathon" in content and this docs folder). Everything below was found by
> reading. Items are flagged only — nothing has been changed.

## 1. Dead code & unused modules

| Item | Evidence | Impact |
|---|---|---|
| **`serp` dependency + `types/serp.d.ts`** | No `import "serp"` anywhere; the LeetCode route scrapes Google with plain `fetch` | Ships dead code; ambient decl misleads readers into thinking `serp` is used |
| **`date-fns` dependency** | Zero imports; all date math hand-rolled | Extra install weight |
| **`jsdom` devDependency** | `vitest.config.ts` uses `environment: 'node'`; no spec references jsdom | Extra install weight |
| **Entire `lib/mentor/` module** (`mentor-provider.ts`, `mentor-context-builder.ts`, `mentor-context-types.ts`, `mock-mentor-provider.ts`, `mentor-provider-factory.ts`) + **`lib/ai/ai-provider.ts`** | `getMentorProvider`/`buildMentorContext`/`MockMentorProvider` have **no callers** outside the module. The real `/mentor` page uses the `/api/chat` retrieval bot instead | The README sells "MentorProvider → MockMentorProvider" as a live seam; in reality the chatbot route bypasses this architecture entirely (two parallel mentor concepts coexist) |
| **`lib/events/event-logger-factory.ts`** (`getEventLogger`) | Callers instantiate `new LocalEventLogger()` directly (onboarding-form, task-detail-client), bypassing the factory + its Supabase guard | Inconsistent with the stated "everything behind factories" pattern |
| **`lib/kb/registry.ts` — half the accessors** | `getTasksByIds`, `getAntiPatternById`, `getDecisionGuides`, `getMentorNotes`, `getOpportunities`, `getJourneyForSegment`, `getJourneyByFilename`, `getAllKBCards` have no callers (pages read from the client snapshot instead) | Aspirational server-side API that isn't wired |
| **`components/motion/reveal.tsx`** (`Reveal`, `Stagger`, `StaggerItem`, `PageFade`) | No importers | Dead component file |
| **`components/ui/typography.tsx`** | Only re-exported by `components/ui/index.ts`; no page uses `Title`/`Body`/etc. | Dead primitives |
| **`CardFooter`** (`components/ui/card.tsx`) | Defined + exported, never rendered anywhere | Dead export |
| **`google.html`** (repo root) | Saved, obfuscated Google SERP page — dev artifact from building the SERP scraper | Dead weight; confusing at repo root |
| **`NEXT_PUBLIC_APP_ENV`** env var | In `.env.example`, read nowhere | Dead config |

## 2. Likely bugs

| # | Issue | Location | Detail |
|---|---|---|---|
| 1 | **Undefined Tailwind color `text-white-ink`** | `components/ui/button.tsx` `primary` variant | Tailwind config defines `base/panel/ink/…` tokens but no `white-ink`. `text-base-ink` (used everywhere else) resolves to `text-[color:base]-ink`… which is also not a defined utility — it only "works" visually because Tailwind emits nothing and buttons fall back to inherited color. Either way the `primary` variant's intent (white text on dark `bg-ink`) silently fails. 15 usages of `text-base-ink` sit on lime `bg-accent` backgrounds, where dark ink is wanted — so a fix should target the token definition, not the call sites. |
| 2 | **Conditional `useMemo` after early return** | `app/courses/dsa/[id]/page.tsx` (`if (!mod) return …` then `const questions = useMemo(...)`) | Violates the Rules of Hooks. Works today because `mod` is stable for a given URL, but any dependency-order change or fast-refresh path can crash. ESLint `react-hooks` would flag it if enabled. |
| 3 | **`estimated_hours` vs `estimatedHours` frontmatter mismatch** | KB cards vs `lib/kb/schemas.ts` | Sampled cards (e.g. `content/kb/tasks/setup-unix-dev-environment.md`) write snake_case `estimated_hours`, while `RawTaskSchema` expects camelCase `estimatedHours` → those tasks lose `estimatedHours` in normalization. Downstream: `hoursSuffice` scoring treats them as 0h, Top-3 shows "Varies". Cards also carry `skills:` frontmatter that no schema reads. (Note `kb/cards/*` mirror cards use camelCase — the two folders disagree.) |
| 4 | **`StudentState.analytics` never populated; `resumeData` legacy-only** | `types/student.ts`, grep | `AnalyticsData` is declared and documented but nothing ever writes it; `resumeData?: Array<{section,content}>` is the legacy resume shape, still on the type but only consumed by the one-time migration path. Dead fields invite confusion. |
| 5 | **`savedOpportunityIds` / `dismissedWarningIds` never written** | grep across app/components | The recommendation engine reads both to filter, but no UI ever saves an opportunity or dismisses a warning, so those filters are no-ops in practice. |
| 6 | **KB `status: draft` is never filtered** | `lib/kb/loader.ts` normalizeCard; pages | Cards default to `status: 'draft'` when frontmatter omits it, and nothing checks `status === 'published'` before rendering or recommending. A draft card silently goes live. |
| 7 | **Onboarding uses `window.location.href`** | `components/onboarding/onboarding-form.tsx` | Full page reload instead of `router.push` (forces a fresh KB-less rehydration). Inconsistent with the rest of the app's client navigation. |
| 8 | **Demo-data button bypasses the provider** | `components/landing/cta-buttons.tsx` | Writes a hardcoded demo student via `LocalStudentRepository` directly rather than the repository factory (skips the Supabase guard) — inconsistent with every other write path. |
| 9 | **Typing streak/consistency edge cases** | `lib/typing/generator.ts`, `components/typing/typing-engine.tsx` | WPM counts a correct first character even before the timer starts (startedAt set on first keystroke — same keystroke is counted); consistency samples are synthetic (interpolated per second from cumulative chars) rather than measured. Minor accuracy skew, worth knowing if comparing with monkeytype etc. |
| 10 | **Focus timer keeps running when tab hidden** | `components/focus/focus-timer.tsx` | `setInterval` drifts/pauses in background tabs; completing a 25-min session in a background tab can record a wrong duration. Also `addSession` is called inside a state updater's tick (side effect within `setState`). |
| 11 | **`card-not-in-journey` warnings are guaranteed noise** | `lib/kb/validate.ts` + real content | With 77 cards and 4 journeys, many cards are intentionally not referenced by journeys (e.g. year-specific extras), so `/admin/kb` always shows a pile of "not referenced by any journey" warnings. Behavior as coded, arguably by design — but reads like an error to newcomers. |
| 12 | **Duplicate card ids across `content/kb` and `kb/cards`** | Both folders | `kb/cards/*` intentionally duplicates several ids (`stuck-on-a-dsa-problem`, `placement-prep-behind-peers`, …). Harmless only because the app loader reads `content/kb` exclusively — but any future globbing of both folders (as `sources.ts` fingerprint scanning already does over `kb/knowledge-base`) would collide. |

## 3. Security / robustness concerns (flag only)

- **No auth anywhere**, and `/admin/kb` is in the public sidebar (05-AUTH_AND_CONFIG.md). Fine for a local demo, not for a shared deployment.
- **Google SERP scraping** (`app/api/leetcode/search/route.ts`): unauthenticated, unthrottled outbound scraping on a user-triggered route; no timeout on the fetch; a captcha/HTML change breaks the feature; possible ToS exposure. Also logs raw results with `console.log`.
- **No input length caps** on `/api/chat` `message`/`history` (a multi-MB payload would be tokenized and embedded — cheap DoS vector on a public deploy).
- **Gemini key in URL** (`lib/kb/llm.ts` `?key=` query param) — appears in server logs/proxies. Server-side only today, but a footgun if ever proxied through the client.
- **localStorage trust**: student state, course progress, resume are read back with `JSON.parse` and (mostly) no schema validation — a corrupted or hand-edited key can crash a page (e.g. `student.name.split(' ')[0]` on a non-string). Resume loading is the only place doing defensive merging.
- **`.env` present in the working tree** with real values (gitignored ✅) — just don't copy it into images/builds.

## 4. Inconsistencies / vibe-coded smells

- **Two different mentor architectures** coexist: the documented `MentorProvider`/`MockMentorProvider` seam (unused) and the actual `/api/chat` vector-retrieval bot. README still describes both as if one system.
- **Factory pattern honored everywhere except** where it matters: events (direct `new LocalEventLogger()`), demo student creation (direct repository), and the chatbot (no `MentorProvider` involvement at all).
- **`console.log`-heavy leetcode route** vs the tidy `[chat]`-prefixed structured logging in the chat route — different conventions in the only two API files.
- **Journey-engine `warning` type mapping** (`'year-1'`-suffixed ids like `polyglot-trap-year-1`) vs `kb/cards` equivalents without suffixes (`polyglot-trap`): the two KB folders drifted in id conventions. Tests currently pin the content/kb versions.
- **Relative import** `../../app/admin/kb/actions` in `components/admin/kb-report.tsx` — the only non-`@/` cross-tree import in the codebase.
- **Typing history cap 500 / focus cap 200 / events uncapped** — three different retention policies, none documented in UI.
- **`docs/` previously contained two AI-generated files** (00, 01) describing a slightly different architecture than reality (e.g. claimed `lib/typing/typing-storage.ts`, `KBProvider.tsx` filenames; claimed `useKB` hydration steps that don't match the code). Rewritten by this scan; keep them in sync going forward.

## 5. Test / tooling gaps

- No `typecheck` npm script (use `npx tsc --noEmit`) and no CI config in the repo.
- `npm test` runs **watch mode** — unattended/CI usage must call `vitest run`.
- No tests for: providers, API routes, chat-window UI, resume builder/migration, course progress. The pure domain layer is well covered (45 tests, all passing at scan time).
- The two content-validation suites (`kb-integration`, `kb-interview-prep-cards`) hardcode counts (77 cards / 22 cards) — adding content requires updating tests, which is intentional friction but worth knowing.

## 6. Content-level TODOs (from kb/ARCHITECTURE.md §7, restated)

- Back-fill `approach`, `solution_code`, and full lesson bodies for `dsa_questions` from the original `.mhtml`/`.py` sources (catalog metadata is complete, explanations are not).
- Keep `kb/sql/seed-kb-cards.sql` in sync with `kb/cards/*.md` (a test enforces this).
- Segment coverage: only `btech-cse-1..4` resolve; other degrees/branches fall back to `year-1-cse` at onboarding (`onboarding-form.tsx` silently substitutes the fallback journey — no user warning).
