import fs from "fs/promises";
import type { Stats } from "fs";
import path from "path";
import { loadKB } from "./loader";
import type { RawSourceDoc } from "./chunker";

/**
 * Collects every retrievable source document in the KB (markdown, text
 * and PDF). Shared by the offline index build (scripts/build-kb-index.ts)
 * and the in-memory fallback in lib/kb/corpus.ts so both paths ingest
 * identically. NOTE: no "server-only" import here — the offline build
 * script runs outside Next; corpus.ts carries the server-only guard.
 */

const CWD = process.cwd();
const KB_DEEP_ROOT = `${CWD}/kb/knowledge-base`;

const SUBJECT_DIRS = [
  "dsa",
  "dbms",
  "oops",
  "operating-systems",
  "computer-networks",
  "system-design",
  "software-engineering",
];

/** Roadmap topics most relevant to this platform's audience (CS students, interviews). */
const ROADMAP_ALLOWLIST = [
  "leetcode",
  "system-design",
  "datastructures-and-algorithms",
  "computer-science",
  "javascript",
  "typescript",
  "react",
  "nextjs",
  "python",
  "cpp",
  "java",
  "backend",
  "frontend",
  "full-stack",
  "git-github",
  "sql",
  "api-design",
  "machine-learning",
  "ai-engineer",
  "devops-beginner",
  "backend-beginner",
  "frontend-beginner",
  "git-github-beginner",
  "software-design-architecture",
  "design-system",
  "prompt-engineering",
];

const MAX_CARD_CONTENT = 6000;
/** Cap on PDFs ingested (text extraction is slow; cheatsheets are what matter). */
const MAX_PDFS = 60;

async function readDirSafe(dir: string): Promise<string[]> {
  try {
    return await fs.readdir(dir);
  } catch {
    return [];
  }
}

async function readFileSafe(file: string): Promise<string | null> {
  try {
    return await fs.readFile(file, "utf-8");
  } catch {
    return null;
  }
}

/** Walk a directory recursively collecting .md/.txt files (bounded). */
async function walkMdTxt(
  dir: string,
  kind: RawSourceDoc["kind"],
  maxFiles: number,
  maxDepth = 4
): Promise<RawSourceDoc[]> {
  const docs: RawSourceDoc[] = [];
  const stack: Array<{ dir: string; depth: number }> = [{ dir, depth: 0 }];

  while (stack.length > 0 && docs.length < maxFiles) {
    const { dir: d, depth } = stack.pop()!;
    for (const entry of await readDirSafe(d)) {
      if (docs.length >= maxFiles) break;
      const full = `${d}/${entry}`;
      let stat: Stats;
      try {
        stat = await fs.stat(full);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        if (depth < maxDepth) stack.push({ dir: full, depth: depth + 1 });
        continue;
      }
      if (stat.size > 512 * 1024) continue; // skip pathological files
      if (!/\.(md|txt)$/i.test(entry)) continue;
      const content = await readFileSafe(full);
      if (!content || content.trim().length < 60) continue;
      const rel = path.relative(CWD, full);
      docs.push({
        id: `note:${rel}`,
        title: docTitleFrom(rel, content),
        path: rel,
        content,
        kind,
      });
    }
  }
  return docs;
}

/** Walk a directory recursively collecting .pdf files (bounded). */
async function walkPdfs(dir: string, maxFiles: number, maxDepth = 3): Promise<RawSourceDoc[]> {
  const { default: pdfParse } = await import("pdf-parse");
  const docs: RawSourceDoc[] = [];
  const stack: Array<{ dir: string; depth: number }> = [{ dir, depth: 0 }];

  while (stack.length > 0 && docs.length < maxFiles) {
    const { dir: d, depth } = stack.pop()!;
    for (const entry of await readDirSafe(d)) {
      if (docs.length >= maxFiles) break;
      const full = `${d}/${entry}`;
      let stat: Stats;
      try {
        stat = await fs.stat(full);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        if (depth < maxDepth) stack.push({ dir: full, depth: depth + 1 });
        continue;
      }
      if (!/\.pdf$/i.test(entry) || stat.size > 40 * 1024 * 1024) continue;
      try {
        const parsed = await pdfParse(full);
        const text = (parsed.text ?? "").replace(/\u0000/g, "").trim();
        if (text.length < 200) continue; // scanned/image PDFs have no text layer
        const rel = path.relative(CWD, full);
        docs.push({
          id: `note:${rel}`,
          title: docTitleFrom(rel, text.slice(0, 400)),
          path: rel,
          content: text.slice(0, 300_000),
          kind: "note",
        });
      } catch {
        continue; // corrupt/DRM pdf — skip
      }
    }
  }
  return docs;
}

function docTitleFrom(rel: string, content: string): string {
  const h1 = /^#\s+(.+)$/m.exec(content);
  if (h1) return h1[1].replace(/[#*`]/g, "").trim().slice(0, 120);
  const base = path.basename(rel).replace(/\.(md|txt)$/i, "").replace(/@.*$/, "");
  return base.replace(/[-_]+/g, " ").trim() || rel;
}

async function loadCardDocs(): Promise<RawSourceDoc[]> {
  const kb = await loadKB();
  if (!kb.ok) return [];
  const all = [
    ...kb.value.tasks,
    ...kb.value.antiPatterns,
    ...kb.value.decisions,
    ...kb.value.mentorNotes,
    ...kb.value.opportunities,
  ];
  return all.map((c) => ({
    id: `card:${c.id}`,
    title: c.title,
    path: `content/kb/${c.type}/${c.id}.md`,
    content: `${c.title}\n\n${c.description}\n\n${c.content}`.slice(0, MAX_CARD_CONTENT),
    kind: "card" as const,
  }));
}

async function loadSubjectDocs(): Promise<RawSourceDoc[]> {
  const docs: RawSourceDoc[] = [];
  for (const subject of SUBJECT_DIRS) {
    docs.push(...(await walkMdTxt(`${KB_DEEP_ROOT}/${subject}`, "note", 400)));
  }
  docs.push(...(await walkMdTxt(`${KB_DEEP_ROOT}/student-resources`, "note", 20, 2)));
  // PDFs: subject cheatsheets + interview-prep material (capped).
  for (const subject of SUBJECT_DIRS) {
    docs.push(...(await walkPdfs(`${KB_DEEP_ROOT}/${subject}`, 8, 2)));
    if (docs.length > MAX_PDFS) break;
  }
  docs.push(...(await walkPdfs(`${KB_DEEP_ROOT}/interview-prep`, Math.max(0, MAX_PDFS - docs.length), 2)));
  return docs;
}

async function loadRoadmapDocs(): Promise<RawSourceDoc[]> {
  const docs: RawSourceDoc[] = [];
  for (const rm of ROADMAP_ALLOWLIST) {
    docs.push(...(await walkMdTxt(`${KB_DEEP_ROOT}/roadmaps/${rm}/content`, "roadmap", 400, 1)));
  }
  return docs;
}

/** All retrievable sources: mentoring cards + subject notes + roadmap topics. */
export async function collectSources(): Promise<RawSourceDoc[]> {
  const [cards, subjects, roadmaps] = await Promise.all([
    loadCardDocs(),
    loadSubjectDocs(),
    loadRoadmapDocs(),
  ]);
  return [...cards, ...subjects, ...roadmaps];
}
