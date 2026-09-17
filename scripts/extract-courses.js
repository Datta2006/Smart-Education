/**
 * One-off script: converts kb/sql/*.sql seed data into a TypeScript course
 * catalog (lib/courses/catalog.ts). Run from the project root:
 *
 *   node scripts/extract-courses.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function unquote(s) {
  if (s == null) return "";
  s = s.trim();
  if (/^NULL$/i.test(s)) return "";
  if (s.startsWith("'") && s.endsWith("'")) {
    return s
      .slice(1, -1)
      .replace(/''/g, "'")
      .replace(/\\'/g, "'");
  }
  return s;
}

function parseArray(s) {
  const raw = unquote(s);
  if (!raw.toUpperCase().startsWith("ARRAY[")) return [];
  const inner = raw.slice(raw.indexOf("[") + 1, raw.lastIndexOf("]"));
  const out = [];
  let cur = "";
  let inStr = false;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (inStr) {
      if (ch === "'" && inner[i - 1] !== "\\") {
        inStr = false;
      } else {
        cur += ch;
      }
      continue;
    }
    if (ch === "'") {
      inStr = true;
      continue;
    }
    if (ch === ",") {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out.map(unquote);
}

/** Splits a VALUES body into top-level (...) tuples. */
function parseTuples(values) {
  const tuples = [];
  let depth = 0;
  let cur = "";
  let inStr = false;
  for (let i = 0; i < values.length; i++) {
    const ch = values[i];
    if (inStr) {
      cur += ch;
      if (ch === "'") inStr = false;
      continue;
    }
    if (ch === "'") {
      inStr = true;
      cur += ch;
      continue;
    }
    if (ch === "(") {
      depth++;
      if (depth === 1) {
        cur = "";
        continue;
      }
    }
    if (ch === ")") {
      depth--;
      if (depth === 0) {
        tuples.push(cur);
        cur = "";
        continue;
      }
    }
    if (depth >= 1) cur += ch;
  }
  return tuples;
}

/** Splits a tuple body into top-level fields, respecting quotes/arrays/parens. */
function parseFields(tuple) {
  const fields = [];
  let d = 0;
  let f = "";
  let s = false;
  let inArr = false;
  for (let i = 0; i < tuple.length; i++) {
    const ch = tuple[i];
    if (s) {
      f += ch;
      if (ch === "'") s = false;
      continue;
    }
    if (ch === "'") {
      s = true;
      f += ch;
      continue;
    }
    if (ch === "[") inArr = true;
    if (ch === "]") inArr = false;
    if (ch === "(") d++;
    if (ch === ")") d--;
    if (ch === "," && d === 0 && !inArr) {
      fields.push(f.trim());
      f = "";
      continue;
    }
    f += ch;
  }
  fields.push(f.trim());
  return fields;
}

/**
 * Finds `INSERT INTO <table> (cols) VALUES <body>` statements and returns
 * { cols, body } pairs. The body extends to the statement-terminating `;` at
 * top level (not inside strings or parens), or the `ON CONFLICT` clause.
 */
function findInserts(sql, tableName) {
  const out = [];
  const marker = "INSERT INTO " + tableName;
  let idx = sql.indexOf(marker);
  while (idx !== -1) {
    let i = idx + marker.length;
    // column list
    while (i < sql.length && sql[i] !== "(") i++;
    const colStart = i + 1;
    while (i < sql.length && sql[i] !== ")") i++;
    const cols = sql.slice(colStart, i).split(",").map((c) => c.trim());
    // VALUES keyword
    const vIdx = sql.toUpperCase().indexOf("VALUES", i);
    i = vIdx + "VALUES".length;
    // scan body to top-level ';' (respecting strings and parens)
    let depth = 0;
    let inStr = false;
    const bodyStart = i;
    while (i < sql.length) {
      const ch = sql[i];
      if (inStr) {
        if (ch === "'") {
          if (sql[i + 1] === "'") {
            i++; // escaped quote
          } else {
            inStr = false;
          }
        }
      } else if (ch === "'") {
        inStr = true;
      } else if (ch === "(") {
        depth++;
      } else if (ch === ")") {
        depth--;
      } else if (ch === ";" && depth === 0) {
        break;
      }
      i++;
    }
    let body = sql.slice(bodyStart, i);
    const oc = body.toUpperCase().indexOf("ON CONFLICT");
    if (oc !== -1) body = body.slice(0, oc);
    out.push({ cols, body });
    idx = sql.indexOf(marker, i);
  }
  return out;
}

function parseTable(sql, tableName) {
  const rows = [];
  for (const { cols, body } of findInserts(sql, tableName)) {
    for (const t of parseTuples(body)) {
      const fields = parseFields(t);
      const row = {};
      cols.forEach((c, i) => {
        row[c] = fields[i];
      });
      rows.push(row);
    }
  }
  return rows;
}

function mapQuestion(row) {
  const id = unquote(row.id);
  const lc = unquote(row.leetcode_number);
  return {
    id,
    title: unquote(row.title),
    category: unquote(row.category),
    difficulty: unquote(row.difficulty) || "easy",
    source: unquote(row.source) || "grokking-coding-patterns",
    leetcodeNumber: lc && lc !== "" ? Number(lc) : null,
    tags: parseArray(row.tags),
  };
}

function mapTopic(row) {
  return {
    id: unquote(row.id),
    title: unquote(row.title),
    kind: unquote(row.kind) || "concept",
    description: unquote(row.description),
    keyIdeas: parseArray(row.key_ideas),
  };
}

function mapSheet(row) {
  return {
    id: unquote(row.id),
    title: unquote(row.title),
    source: unquote(row.source),
    description: unquote(row.description),
    topics: parseArray(row.topics),
  };
}

const dsaSql = fs.readFileSync(path.join(ROOT, "kb/sql/seed-dsa-questions.sql"), "utf8");
const sdSql = fs.readFileSync(path.join(ROOT, "kb/sql/seed-system-design.sql"), "utf8");

const questions = parseTable(dsaSql, "dsa_questions").map(mapQuestion);
const topics = parseTable(sdSql, "system_design_topics").map(mapTopic);
const sheets = parseTable(dsaSql, "dsa_sheets").map(mapSheet);

// ---- Group into course modules --------------------------------------------
const CATEGORY_LABELS = {
  "sliding-window": "Sliding Window",
  "two-pointers": "Two Pointers",
  "fast-slow-pointers": "Fast & Slow Pointers",
  "merge-intervals": "Merge Intervals",
  "cyclic-sort": "Cyclic Sort",
  "in-place-reversal": "In-place Reversal of a LinkedList",
  "tree-bfs": "Tree Breadth-First Search",
  "tree-dfs": "Tree Depth-First Search",
  subsets: "Subsets",
  "modified-binary-search": "Modified Binary Search",
  "bitwise-xor": "Bitwise XOR",
  "top-k-elements": "Top K Elements",
  "two-heaps": "Two Heaps",
  "k-way-merge": "K-way Merge",
  "topological-sort": "Topological Sort (Graphs)",
  "0-1-knapsack": "0/1 Knapsack (DP)",
  "unbounded-knapsack": "Unbounded Knapsack (DP)",
  "fibonacci-numbers": "Fibonacci Numbers (DP)",
  "palindromic-subsequence": "Palindromic Subsequence (DP)",
  lcs: "Longest Common Subsequence (DP)",
  lis: "Longest Increasing Subsequence (DP)",
  "stack-queues": "Stacks & Queues",
  "linked-list": "Linked Lists",
  "binary-tree": "Binary Trees",
  "binary-search-tree": "Binary Search Trees",
  graphs: "Graphs",
  heaps: "Heaps",
  tries: "Tries",
  "strings-manipulation": "String Manipulation",
  "arrays-hashing": "Arrays & Hashing",
  arrays: "Arrays",
  hashing: "Hashing & Hash Maps",
  strings: "Strings",
  sorting: "Sorting & Searching",
  recursion: "Recursion & Backtracking",
  "bit-manipulation": "Bit Manipulation",
  "math-geometry": "Math & Geometry",
  "intervals": "Intervals",
};

function labelFor(category) {
  if (CATEGORY_LABELS[category]) return CATEGORY_LABELS[category];
  return category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function difficultyCount(items) {
  return {
    easy: items.filter((q) => q.difficulty === "easy").length,
    medium: items.filter((q) => q.difficulty === "medium").length,
    hard: items.filter((q) => q.difficulty === "hard").length,
  };
}

// DSA course modules — grouped by category in first-appearance order.
const dsaByCategory = new Map();
for (const q of questions) {
  if (!dsaByCategory.has(q.category)) dsaByCategory.set(q.category, []);
  dsaByCategory.get(q.category).push(q);
}

const dsaModules = [...dsaByCategory.entries()].map(([cat, qs], i) => ({
  id: `dsa-${cat}`,
  title: labelFor(cat),
  kind: qs.some((q) => q.source === "grokking-dp") ? "dp" : "patterns",
  description: `${qs.length} curated problems on ${labelFor(cat).toLowerCase()} — pattern intro, guided examples, and practice set.`,
  questions: qs,
  ...difficultyCount(qs),
  order: i,
}));

// System design course — concepts first, then design questions.
const sdConcepts = topics.filter((t) => t.kind === "concept");
const sdDesigns = topics.filter((t) => t.kind === "design-question");
const systemDesignModules = [
  {
    id: "sd-concepts",
    title: "Core Concepts",
    kind: "concepts",
    description:
      "The building blocks every design answer needs: caching, load balancing, partitioning, CAP, consistent hashing and more.",
    topics: sdConcepts,
    order: 0,
  },
  {
    id: "sd-designs",
    title: "Design Questions",
    kind: "designs",
    description:
      "Walkthrough designs for the classics — Instagram, Twitter, URL shortener, Dropbox, Messenger, YouTube and more.",
    topics: sdDesigns,
    order: 1,
  },
];

const catalog = {
  generatedAt: new Date().toISOString().slice(0, 10),
  dsa: {
    total: questions.length,
    modules: dsaModules,
  },
  systemDesign: {
    total: topics.length,
    modules: systemDesignModules,
  },
  sheets,
};

const out = `/**
 * Course catalog — GENERATED by scripts/extract-courses.js from kb/sql seeds.
 * Do not edit by hand; re-run the script instead.
 *
 * Source: Interview-Preparation-Notes-master → kb/sql/*.sql
 * (${questions.length} DSA questions · ${topics.length} system design topics · ${sheets.length} sheets)
 */

export interface CourseQuestion {
  id: string;
  title: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  source: string;
  leetcodeNumber: number | null;
  tags: string[];
}

export interface CourseTopic {
  id: string;
  title: string;
  kind: "design-question" | "concept";
  description: string;
  keyIdeas: string[];
}

export interface DsaModule {
  id: string;
  title: string;
  kind: "patterns" | "dp";
  description: string;
  questions: CourseQuestion[];
  easy: number;
  medium: number;
  hard: number;
  order: number;
}

export interface SystemDesignModule {
  id: string;
  title: string;
  kind: "concepts" | "designs";
  description: string;
  topics: CourseTopic[];
  order: number;
}

export interface DsaSheet {
  id: string;
  title: string;
  source: string;
  description: string;
  topics: string[];
}

export interface CourseCatalog {
  generatedAt: string;
  dsa: { total: number; modules: DsaModule[] };
  systemDesign: { total: number; modules: SystemDesignModule[] };
  sheets: DsaSheet[];
}

export const COURSE_CATALOG: CourseCatalog = ${JSON.stringify(catalog, null, 2)};
`;

fs.mkdirSync(path.join(ROOT, "lib/courses"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "lib/courses/catalog.ts"), out);
console.log(
  `catalog.ts written: ${questions.length} DSA questions in ${dsaModules.length} modules, ${topics.length} SD topics, ${sheets.length} sheets`
);
