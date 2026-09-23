# Student OS — API Routes & Server Actions

> The entire server surface is **2 route handlers + 1 server action**. There is no middleware,
> no auth layer, and no other network access from the client except Google Fonts at build time.
> All handlers use the Node.js runtime (`export const runtime = "nodejs"` on /api/chat; the
> leetcode route uses fs/fetch so it also needs Node, though it does not pin the runtime
> explicitly — Next 14 defaults API routes to Node).

## Feature: KB chatbot

### `POST /api/chat`
- **File:** `app/api/chat/route.ts` (read in full; verified)
- **Auth:** none. **Rate limit:** none. **CORS:** same-origin only (Next default).
- **Request body (JSON):**
  ```jsonc
  {
    "message": "string (required, trimmed; empty → 400)",
    "history": [ { "role": "string", "content": "string" } ]  // optional; entries failing
  }                                                            // the typeof checks are dropped
  ```
  Parsing is defensive: `req.json().catch(() => null)`, and `body?.message` is type-checked.
- **Behavior:**
  1. Greetings (`^(hi|hey|hello|yo|namaste|hii+|hlo|hola)\b`, case-insensitive) short-circuit
     with a canned answer + suggestion list, no retrieval.
  2. Loads the retrieval index via `getRetrievalIndex()` (persisted `kb/index/kb-index.json`
     or in-memory fallback), runs `retrieve()` (dense + BM25 → RRF → rerank → evidence gate).
  3. Zero confident candidates → `{ answer: NO_MATCH_ANSWER, sources: [], suggestions, corpusSize }`.
  4. Otherwise: `generateGrounded()` if `AI_PROVIDER` ≠ mock AND `AI_API_KEY` set (OpenAI or
     Gemini, strict "answer only from chunks, cite [n]" prompt, 20s timeout, falls back to
     extractive on any error); else `buildExtractiveAnswer()` composes `[n] title — section`
     snippets via `extractRelevant()`.
  5. `KB_DEBUG=1` enables candidate-table logging (passed as `console.debug`).
- **Response (200, JSON):**
  ```jsonc
  {
    "answer": "markdown string",
    "sources": [ { "title", "path", "kind": "card|note|roadmap", "section", "score" /* 0..1 */, "ref" /* 1-based */ } ],
    "suggestions": ["up to 4 strings"],
    "corpusSize": 123
  }
  ```
- **Errors:** `400 {"error":"Empty message"}`; `500 {"error":"Knowledge base failed to load. Try again in a moment."}` (index build/load failure).
- **Caller:** `components/chatbot/chat-window.tsx` (`send()`), which maps failures to a friendly bot message.

## Feature: LeetCode lookup

### `POST /api/leetcode/search`
- **File:** `app/api/leetcode/search/route.ts` (read in full; verified)
- **Auth:** none. **Rate limit:** none. **Cost:** one outbound `fetch` to Google per call.
- **Request body (JSON):** `{ "topic": "string (required)" }` → query becomes
  `` `${topic} site:leetcode.com/problems/` ``.
- **Behavior:** fetches `https://www.google.com/search?q=…&num=10` with a desktop Chrome
  User-Agent + `cache: "no-store"`, regex-extracts `/url?q=` redirect targets and direct
  `leetcode.com/problems/<slug>` URLs, de-duplicates, returns the first.
- **Response:**
  - `200 { "url": "https://leetcode.com/problems/<slug>", "query": "…" }`
  - `400 {"error":"Topic is required"}`
  - `404 {"error":"No LeetCode problem found", "query"}`
  - `502 {"error":"Google returned <status>"}`
  - `500 {"error":"Search failed"}`
- **⚠️ Reliability note (flagged, not fixed):** scraping Google SERPs is brittle (CAPTCHAs,
  HTML changes, ToS) and there is **no API key or auth**. Works today, fragile tomorrow.
- **Caller:** `app/courses/dsa/[id]/page.tsx` — `openLeetCode()` pre-opens a blank tab
  (`window.open`), fills it with the resolved URL, closes it and `alert()`s on failure.

## Feature: KB admin

### Server action `revalidateAndFetch()` — `'use server'`
- **File:** `app/admin/kb/actions.ts` (read in full; verified)
- **Signature:** `() => Promise<{ ok: boolean; report?: KBValidationReport; error?: string }>`
- **Behavior:** `revalidateKB()` (drops the module-level KB cache) → `getKBReport()` →
  `loadKB()` again + `validateKBSnapshot()`.
- **Auth:** none. ⚠️ Any visitor can hit `/admin/kb` (it's even in the main sidebar) and force
  KB reloads. Harmless in a local demo; would need gating before any real deployment.
- **Caller:** `components/admin/kb-report.tsx` "Re-validate KB" button. ⚠️ Imported via relative
  path `../../app/admin/kb/actions` instead of the `@/` alias used everywhere else.

## What is *not* an API

- Student/typing/focus/course/resume persistence: **never touches the network** — all
  localStorage (see 03-DATA_MODELS.md §2).
- The domain engines (recommendations, journey, scoring): pure client-side functions.
- KB content: read from disk at request time by server components / the layout; shipped to the
  client as a serialized snapshot in the provider tree.
