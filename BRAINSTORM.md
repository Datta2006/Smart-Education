# Student OS — Brainstorm & Build Plan

> Everything I think the final, deployable project needs, and what I decided to build.
> Written before implementation, then checked against reality after.

## 1. What is this product?

**Student OS (SOS)** — a personal operating system for a CS / engineering student.
It already knows *who you are* (degree, year, goals, skills, hours), gives you a
phase-by-phase journey built from a curated knowledge base, mentors you, and —
after this build — trains your hands too.

Current state (from reading the code):
- Landing → Onboarding → Dashboard / Journey / Explore / Mentor / Profile / Settings / Weekly Review / Admin KB.
- KB cards (tasks, anti-patterns, decisions, mentor notes, opportunities) load from `content/kb`.
- A prototype typing test and a prototype "vector chatbot" exist but are rough, unpolished, and not wired into the student state.
- One file (`components/profile/profile-page.tsx`) is a broken duplicate that breaks `tsc`.

## 2. Design read

**"A premium, speed-focused productivity tool for technical students. Dark, high-contrast,
terminal-grade, with a signature accent that says speed."**

- Family: custom Tailwind design system (existing project, no new UI framework).
- Theme: dark-first, single locked theme (monkeytype / Linear dark energy). Design tokens via CSS variables so a light theme stays possible later.
- Palette: zinc near-black base, **lime-green signature accent** (`#B4F34A`), coral for errors, amber for focus, ice-blue for info.
- Type: **Space Grotesk** (display + body) paired with **JetBrains Mono** (typing, stats, code).
- Dials: `VARIANCE 7 / MOTION 7 / DENSITY 5`.
- Motion: framer-motion (Motion) for springs/layout; CSS transitions for micro-UI; strict `prefers-reduced-motion` support; only `transform` + `opacity`.

## 3. Features to build (user request + my additions)

### 3.1 Typing Test — `/typing` (core ask)
- **One-button experience**: a single, unmissable "Start Test" CTA. Pick difficulty first; one button starts.
- **Random text generated at test time — never normal words.** Four difficulties:
  - **Easy** → random lowercase tokens (short "words" of random letters).
  - **Medium** → mixed lower + uppercase.
  - **Hard** → adds digits.
  - **Extreme** → adds symbols + every shift key.
- Live per-character rendering (correct / wrong / current caret), live WPM + accuracy + timer, progress bar, error shake.
- Result screen: animated count-up WPM / accuracy / raw / consistency, difficulty label, "Test again" + "Try harder level".
- **Persistence**: every test saved to localStorage (per student); feeds profile analytics; kept as history list.

### 3.2 KB Chatbot — `/mentor` (core ask)
- **Zero external LLM.** Pure local vector retrieval + trimming/synthesis.
- Improved local vector store: token + character n-gram hashing, TF-weighting, cosine similarity.
- **Server-side KB index** over: mentoring cards (`content/kb`) + the big `kb/knowledge-base` corpus (roadmaps, notes, cheat-sheets) — chunked, deduped.
- `/api/chat` route: embed query → top-k chunks → **synthesize an answer by trimming and merging snippets** → return answer + sources.
- Chat UI: typing indicator, message bubbles, source chips, suggested questions, conversation memory, "built on vector search · no LLM" disclosure.

### 3.3 Profile / Resume — `/profile` (core ask)
- **Skills board**: all `student.skills` + auto-derived "Typing" skill with live stats.
- **Typing analytics**: real data from localStorage — animated SVG line/area chart of WPM over time, max/avg/accuracy/streak cards, difficulty distribution.
- **Resume builder**: editable sections (Overview, Education, Projects, Skills…), live resume preview, **print / save-as-PDF** via print stylesheet, stored to localStorage.

### 3.4 Top-notch animation everywhere
- Landing: hero with animated signature-text, staggered reveals, ambient gradient field, magnetic CTAs.
- Shell: animated active-pill, page transitions, animated progress.
- Dashboard: count-up stat cards, scroll reveals, micro-interactions.
- Typing: caret pulse, error shake, result confetti burst, count-ups.
- Chatbot: thinking dots, bubble pop-in.

### 3.5 Extra features I'm adding
- **Focus Timer** — animated pomodoro ring (25 / 50 min), session log persisted.
- **Streak** — days with typing practice computed from history.
- **Quick actions** on dashboard (typing test, focus, mentor).
- **Weekly review polish** + settings improvements (reset data, export typing history as JSON).
- **Admin KB polish** (report cards unchanged, restyled).

## 4. Architecture decisions

- Keep Next.js 14 App Router + Tailwind + TypeScript strict. No new framework.
- Add `framer-motion` for springs/layout animations (only new runtime dep).
- Typing + focus + resume persistence: `localStorage` behind small typed helpers in `lib/`, wired into `StudentProvider.analytics` and a new `TypingProvider`.
- Chatbot: server-side index built lazily + cached; API route returns synthesized answers. Ships on Vercel (Node runtime) with zero env config.
- Icons: keep `lucide-react` (already the project family).
- Fonts: `next/font` — Space Grotesk + JetBrains Mono (Google Fonts, self-hosted at build).

## 5. Files to touch / create

- `BRAINSTORM.md` (this) · `app/globals.css` (tokens + keyframes) · `tailwind.config.ts`
- `app/layout.tsx` (fonts, providers) · new `providers/typing-provider.tsx`
- `lib/typing/generator.ts` · `lib/typing/storage.ts` · `lib/typing/analytics.ts`
- `app/typing/page.tsx` + `components/typing/*`
- `lib/kb/vector-store.ts` (v2) · `lib/kb/corpus.ts` (server index) · `app/api/chat/route.ts`
- `components/chatbot/chat-window.tsx` (new UI) · `app/mentor/page.tsx`
- `app/profile/page.tsx` + `components/profile/*` (skills, chart, resume, print)
- `components/layout/app-shell.tsx` (redesign) · `app/page.tsx` (landing redesign)
- `app/dashboard/page.tsx` (polish + quick actions) · `app/focus/page.tsx` (new)
- `components/focus/focus-timer.tsx` · `app/weekly-review/page.tsx` (polish)
- delete broken `components/profile/profile-page.tsx`

## 6. Definition of done

1. `npx tsc --noEmit` clean · `npm run build` green · `npm run lint` green.
2. Typing test: generate → type → result → saved → shown in profile graph.
3. Chatbot answers real KB questions locally, with sources, no network LLM.
4. Profile shows real typing analytics + skills + printable resume.
5. Dark premium redesign consistent across every page; reduced-motion honored.
6. README updated.