-- ============================================================================
-- Knowledge Base schema (PostgreSQL / Supabase-ready)
-- Source: Interview-Preparation-Notes-master  →  kb/ARCHITECTURE.md
--
-- Tables:
--   kb_cards              mirrors markdown card frontmatter (content/kb format)
--   dsa_questions         full DSA question catalog (patterns, difficulty, code)
--   system_design_topics  system design questions + core concepts
--   dsa_sheets            curated problem sheets
--
-- Run order (see ARCHITECTURE.md §5.2):
--   psql "$DATABASE_URL" -f kb/sql/schema.sql
--   psql "$DATABASE_URL" -f kb/sql/seed-dsa-questions.sql
--   psql "$DATABASE_URL" -f kb/sql/seed-system-design.sql
--   psql "$DATABASE_URL" -f kb/sql/seed-kb-cards.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- kb_cards — mentoring cards (type system identical to lib/kb/schemas.ts)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kb_cards (
  id                TEXT PRIMARY KEY,
  type              TEXT NOT NULL CHECK (type IN
                    ('task', 'anti_pattern', 'decision', 'mentor_note', 'opportunity')),
  title             TEXT NOT NULL,
  description       TEXT,
  content           TEXT,                     -- full markdown body (hydrated by loader)
  content_source    TEXT,                     -- relative path to the markdown source file
  degree            TEXT DEFAULT 'btech',
  branch            TEXT DEFAULT 'cse',
  year              INT,
  phase             TEXT,
  goals             TEXT[] DEFAULT '{}',
  tags              TEXT[] DEFAULT '{}',
  priority          TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status            TEXT NOT NULL DEFAULT 'draft',
  -- task-only
  estimated_hours   INT,
  difficulty        TEXT,
  -- mentor_note-only
  trigger_condition TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kb_cards_type   ON kb_cards (type);
CREATE INDEX IF NOT EXISTS idx_kb_cards_year   ON kb_cards (year, phase);
CREATE INDEX IF NOT EXISTS idx_kb_cards_goals  ON kb_cards USING GIN (goals);

-- ----------------------------------------------------------------------------
-- dsa_questions — the question catalog (full seed: kb/sql/seed-dsa-questions.sql)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dsa_questions (
  id                TEXT PRIMARY KEY,          -- slug
  title             TEXT NOT NULL,
  category          TEXT NOT NULL,             -- pattern, e.g. 'sliding-window'
  difficulty        TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  source            TEXT NOT NULL,             -- 'grokking-coding-patterns' | 'grokking-dp' | 'python-solutions' | ...
  leetcode_number   INT,
  tags              TEXT[] DEFAULT '{}',
  problem_statement TEXT,
  approach          TEXT,
  time_complexity   TEXT,
  space_complexity  TEXT,
  solution_code     TEXT,                      -- dollar-quoted source
  language          TEXT NOT NULL DEFAULT 'python',
  source_ref        TEXT,                      -- original file in the notes folder
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dsa_category     ON dsa_questions (category);
CREATE INDEX IF NOT EXISTS idx_dsa_difficulty   ON dsa_questions (difficulty);
CREATE INDEX IF NOT EXISTS idx_dsa_source       ON dsa_questions (source);
CREATE INDEX IF NOT EXISTS idx_dsa_tags         ON dsa_questions USING GIN (tags);

-- ----------------------------------------------------------------------------
-- system_design_topics — Grokking System Design Interview content
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_design_topics (
  id            TEXT PRIMARY KEY,               -- slug
  title         TEXT NOT NULL,
  kind          TEXT NOT NULL CHECK (kind IN ('design-question', 'concept')),
  description   TEXT,
  key_ideas     TEXT,
  source        TEXT NOT NULL DEFAULT 'grokking-system-design',
  source_ref    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sd_kind ON system_design_topics (kind);

-- ----------------------------------------------------------------------------
-- dsa_sheets — curated problem sheets referenced by the notes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dsa_sheets (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  source        TEXT NOT NULL,                  -- e.g. 'love-babbar-450' | 'grokking' | 'striver-a2z'
  description   TEXT,
  topics        TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
