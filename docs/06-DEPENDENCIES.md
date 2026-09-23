# Student OS — Dependencies

> Source of truth: `package.json` (read in full). "Likely used" claims verified by grepping for
> imports/usages across the repo (node_modules excluded).

## Runtime dependencies

### Framework & UI
| Package | Version | Why it's here | Verified usage |
|---|---|---|---|
| `next` | **14.2.3** (pinned) | App Router framework, routing, server components, `next/font` | everywhere |
| `react` / `react-dom` | ^18 | UI runtime | everywhere |
| `lucide-react` | ^0.378.0 | Icon set used on every page | ~30 files |
| `clsx` + `tailwind-merge` | ^2.1.1 / ^2.3.0 | Class merging via `cn()` in `lib/utils.ts` | all components |
| `framer-motion` | ^11.18.2 | Springs, layout animations, scroll reveals, tilt/magnetic effects, confetti timing | all pages + motion primitives |
| `gray-matter` | ^4.0.3 | Parses YAML frontmatter of KB markdown cards | `lib/kb/loader.ts`, `tests/kb-interview-prep-cards.spec.ts` |
| `zod` | ^3.23.8 | Validation: KB frontmatter schemas, onboarding form schema | `lib/kb/schemas.ts`, `lib/student/student-schema.ts` |
| `react-hook-form` | ^7.85.0 | Onboarding form state/validation | `components/onboarding/onboarding-form.tsx` |
| `@hookform/resolvers` | ^5.7.1 | Bridges RHF → Zod | same file |
| `server-only` | `latest` | Build-time guard that blocks server modules (kb loader/corpus) from client bundles | `lib/kb/loader.ts`, `lib/kb/corpus.ts`; aliased to a stub in vitest |

### Data fetching
None. There is **no** react-query/SWR/axios — the only fetches are `fetch()` in two API routes,
the chat client, and one Google Fonts build step.

### State
No external state library. Five hand-rolled React contexts under `providers/` +
`localStorage` helper modules.

### ⚠️ Installed but unused
| Package | Version | Evidence it's dead |
|---|---|---|
| `serp` | ^2.2.2 | **Zero imports** of `serp` anywhere (the leetcode route scrapes Google with plain `fetch` instead). `types/serp.d.ts` is a declaration for this orphan. Remnant of an earlier implementation. |
| `date-fns` | ^3.6.0 | **Zero imports.** All date math is hand-rolled (`dayKey`, `computeStreak`, `toLocaleDateString`). |

Safe removals (with `types/serp.d.ts`): `serp`, `date-fns`.

## Dev dependencies

| Package | Version | Purpose |
|---|---|---|
| `typescript` | ^5 | Type-checking (`strict: true`); no `typecheck` script exists — use `npx tsc --noEmit` |
| `tsx` | ^4.23.13 | Runs `scripts/build-kb-index.ts` (`npm run kb:build` uses `--conditions=react-server` to satisfy the `server-only` import) |
| `vitest` | ^1.6.0 | Test runner (9 files, 45 tests) |
| `jsdom` | ^24.0.0 | ⚠️ Installed but **unused**: `vitest.config.ts` sets `environment: 'node'` and no spec imports jsdom. Candidate for removal (or was intended for localStorage-dependent tests). |
| `pdf-parse` | ^1.1.4 | PDF → text for KB ingestion (also dynamically imported by `lib/kb/sources.ts` at runtime for the in-memory fallback) |
| `eslint` / `eslint-config-next` | ^8 / 14.2.3 | `npm run lint` |
| `postcss` / `autoprefixer` | ^8 / ^10.4.19 | CSS pipeline (`postcss.config.js`) |
| `tailwindcss` | ^3.4.1 | Styling (`tailwind.config.ts`) |
| `@types/node` / `@types/react` / `@types/react-dom` | ^20 / ^18 / ^18 | Type definitions |

## Scripts (package.json)

| Script | What it does |
|---|---|
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `next lint` (⚠️ no ESLint config file was found in the repo root — relies on `eslint-config-next` defaults resolved by Next) |
| `test` | `vitest` (watch mode — CI/unattended runs should use `vitest run`) |
| `test:ui` | `vitest --ui` |
| `kb:build` | `NODE_OPTIONS=--conditions=react-server tsx scripts/build-kb-index.ts` — rebuilds the chat retrieval index |

## Version notes

- `next` is pinned to an exact 14.2.3 while `eslint-config-next` is 14.2.3 — consistent.
- `server-only: latest` is the only unpinned/unfloated-by-major dep (reproducibility risk, minor).
- React is `^18` — no React 19 / Next 15 features are used; the code is compatible with the
  App Router as of 14.x (e.g. `params` as plain object, not a Promise).
