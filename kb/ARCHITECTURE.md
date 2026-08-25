# Knowledge Base Architecture (`kb/`)

This document describes the architecture of the knowledge base created from
`Interview-Preparation-Notes-master/`, its relationship to the Student OS (SOS)
project, and how each piece of content is stored.

---

## 1. Objective

The SOS app (`content/kb/`) is a mentoring platform for engineering students. It
loads typed "KB cards" (tasks, anti-patterns, decisions, mentor notes,
opportunities) from markdown with YAML frontmatter, validates them, and feeds
them into a deterministic recommendation engine.

The `kb/` folder in this repo extends that idea to **interview preparation
content**. It converts the raw study material in
`Interview-Preparation-Notes-master/` into a queryable, seeded knowledge base
with **two storage models**:

| Content type                                  | Storage            | Why                                                              |
| --------------------------------------------- | ------------------ | ---------------------------------------------------------------- |
| Mentoring cards (tasks, decisions, notes…)    | Markdown + YAML    | Authoring-friendly, matches the existing `content/kb/` format    |
| DSA questions (hundreds, highly structured)   | PostgreSQL (SQL)   | Rows fit a relational table; easy to filter by pattern/difficulty |
| System design topics (designs + concepts)     | PostgreSQL (SQL)   | Same reason — tabular metadata + notes                            |
| DSA sheets (450 sheet, Grokking, A2Z)         | PostgreSQL (SQL)   | Catalog metadata                                                  |

> **Dual-write philosophy:** markdown is the source of truth for *cards*;
> questions/topics are seeded directly into Postgres. The `kb_cards` SQL table
> mirrors card metadata and points at the markdown file (`content_source`) so a
> loader script can hydrate `content` without duplicating bodies.

---

## 2. Folder layout

```
kb/
  ARCHITECTURE.md                 # this document
  sql/
    schema.sql                    # Postgres DDL — 4 tables
    seed-dsa-questions.sql        # INSERTs: dsa_questions (121) + dsa_sheets (3)
    seed-system-design.sql        # INSERTs: system_design_topics (28)
    seed-kb-cards.sql             # INSERTs: kb_cards (mirrors cards/ metadata)
  cards/                          # markdown cards (content/kb-compatible)
    tasks/                        # type: task        (9 cards)
    anti-patterns/                # type: anti_pattern (4 cards)
    decisions/                    # type: decision    (3 cards)
    mentor-notes/                 # type: mentor_note (4 cards)
    opportunities/                # type: opportunity (2 cards)
    journey/
      year-3-cse.json             # phase map → card IDs (template)
```

---

## 3. Content source mapping

Every file in the source notes folder maps to one or more KB artifacts:

| Source (Interview-Preparation-Notes-master)          | KB artifact(s)                                              |
| ---------------------------------------------------- | ----------------------------------------------------------- |
| `20.. Arrays/*.py`, `21.. Strings/*.py`              | `dsa_questions` rows with full approach + code              |
| `4. Grokking the Coding Interview Patterns/*.mhtml`  | `dsa_questions` rows (77) — title, difficulty, pattern      |
| `9. Grokking DP Patterns/*.mhtml`                    | `dsa_questions` rows (34) — DP patterns                     |
| `6. Grokking the System Design Interview/*.mhtml`    | `system_design_topics` rows (28)                            |
| `03.. DSA-SHEETS/Love Babbar 450 DSA Sheet.xlsx`     | `dsa_sheets` row + `cards/tasks/solve-love-babbar-450.md`   |
| `01.. Top Interview Questions Lists/*.pdf`           | `cards/tasks/practice-top-company-questions.md`             |
| `07.. [6 Weeks to Interview Ready]`                  | `cards/tasks/six-week-interview-crash-course.md`            |
| `README.md` (OOPs, OS, DBMS notes)                   | `cards/tasks/revise-core-cs-concepts.md`                    |
| Topic PDFs (Trees, Graph, DP, Sorting, Recursion…)   | `dsa_questions` categories + `cards/tasks/*` guidance       |

`source`/`source_ref` columns in SQL keep provenance: each seeded row says which
course or file it came from, so the rich `.mhtml`/PDF bodies can be extracted and
back-filled later without losing the catalog.

---

## 4. Markdown card model (mirrors `content/kb/`)

Each card is a markdown file with YAML frontmatter. The exact same schema is
validated by `lib/kb/schemas.ts`, so any card here can be dropped into
`content/kb/<type>/` and the SOS app will load it.

```yaml
---
id: master-grokking-coding-patterns   # globally unique slug
type: task                            # task | anti_pattern | decision | mentor_note | opportunity
title: Master the Grokking Coding Patterns
degree: btech
branch: cse
year: 3
phase: placement-prep
goals: [placements, software-internship]
tags: [dsa, patterns]
priority: high
status: published
estimatedHours: 40                    # task-only
difficulty: intermediate              # task-only
trigger_condition: ...                # mentor_note-only
---
# Title
## Objective
## Steps / Options / Mentor message ...   (type-specific sections)
```

Card counts: 9 tasks · 4 anti-patterns · 3 decisions · 4 mentor-notes ·
2 opportunities = **22 cards**, plus a journey template.

The journey template (`cards/journey/year-3-cse.json`) follows the
`content/kb/journey/*.json` shape (phases → card IDs) so it can be merged into
the app's journey lookup verbatim.

---

## 5. SQL model (PostgreSQL / Supabase-ready)

### 5.1 Tables (`sql/schema.sql`)

```sql
kb_cards              -- mirrors card frontmatter; content_source → markdown path
dsa_questions         -- the big catalog: title, category/pattern, difficulty,
                      --   source, leetcode_number, approach, complexity, code
system_design_topics  -- design questions + core concepts
dsa_sheets            -- curated problem sheets (Love Babbar 450, Grokking, A2Z)
```

All tables use `TEXT` ids as slugs, `TIMESTAMPTZ` for timestamps, and
`TEXT[]` for tags/goals. `difficulty` and `type` columns are `CHECK`-constrained
so bad data fails at insert time, not at query time.

### 5.2 Running the seed

Local Postgres (all seeds are idempotent — `ON CONFLICT (id) DO NOTHING`, so re-running is safe):

```bash
psql "$DATABASE_URL" -f kb/sql/schema.sql
psql "$DATABASE_URL" -f kb/sql/seed-dsa-questions.sql
psql "$DATABASE_URL" -f kb/sql/seed-system-design.sql
psql "$DATABASE_URL" -f kb/sql/seed-kb-cards.sql
```

Supabase: open the **SQL Editor** and paste `schema.sql`, then each seed file in
order (or use `supabase db push` with the files under `supabase/migrations/`).

### 5.3 Useful queries

```sql
-- Question bank grouped by pattern
SELECT category, count(*) FROM dsa_questions GROUP BY category ORDER BY 2 DESC;

-- Prepare for an interview: medium/hard sliding-window problems
SELECT title, difficulty, leetcode_number FROM dsa_questions
WHERE category = 'sliding-window' AND difficulty IN ('medium','hard')
ORDER BY difficulty DESC;

-- Card metadata joined to its markdown source
SELECT id, type, title, content_source FROM kb_cards WHERE year = 3;
```

---

## 6. Wiring this KB into the SOS app

`kb/cards/` is intentionally format-identical to `content/kb/`, so syncing is a
copy:

```bash
# one-time (or via a small script)
cp -R kb/cards/tasks/*         content/kb/tasks/
cp -R kb/cards/anti-patterns/* content/kb/anti-patterns/
cp -R kb/cards/decisions/*     content/kb/decisions/
cp -R kb/cards/mentor-notes/*  content/kb/mentor-notes/
cp -R kb/cards/opportunities/* content/kb/opportunities/
cp    kb/cards/journey/year-3-cse.json content/kb/journey/
```

Then `/admin/kb` validates the new cards (duplicate ids, missing references,
type mismatches). Add the new card ids to the appropriate journey phases and the
recommendation engine will start surfacing them.

For the SQL side, the README's Supabase migration path applies unchanged:
implement a repository that reads `dsa_questions` and feed results into the
existing pure domain engines.

---

## 7. Source-of-truth & evolution rules

1. **Cards:** markdown wins. Edit `kb/cards/`, then re-run the seed (`seed-kb-cards.sql`)
   or the sync script to refresh the DB mirror.
2. **Questions/topics:** SQL wins. New `.mhtml`/`.py` lessons extracted later are
   appended as new `INSERT` rows (or upserts on `id`).
3. **Ids are globally unique slugs** — never reuse an id across cards or questions.
4. **Keep the SQL mirror in sync** — when a card is added/renamed in `kb/cards/`, update
   `seed-kb-cards.sql` (id, type, `content_source`) and add the id to the journey if needed.
   `tests/kb-interview-prep-cards.spec.ts` fails if the mirror drifts from the markdown.
4. **Extraction backlog** (documented, not blocking): back-fill `approach`,
   `solution_code` and full lesson bodies from the `.mhtml` files; the catalog
   (titles, difficulties, patterns, sources) is already complete.
