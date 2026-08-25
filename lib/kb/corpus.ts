import "server-only";
import fs from "fs/promises";
import path from "path";
import { loadKB } from "./loader";
import { VectorStore, type StoredDoc } from "./vector-store";

/**
 * Builds the searchable corpus: mentoring cards + the deep knowledge-base
 * (subject notes, tutorials, cheatsheets and roadmap cards). Built lazily
 * once and cached in memory.
 */

const CWD = process.cwd();
const KB_CARDS_ROOT = path.join(CWD, "content/kb");
const KB_DEEP_ROOT = path.join(CWD, "kb/knowledge-base");

const SUBJECT_DIRS = [
  "dsa",
  "dbms",
  "oops",
  "operating-systems",
  "computer-networks",
  "system-design",
  "software-engineering",
];

const SUBDIRS = ["notes", "tutorials", "sheets"];

const MAX_FILES_PER_DIR = 40;
const MAX_ROADMAP_CONTENT = 500;
const MAX_DOC_SIZE = 6000;

async function readMarkdownFiles(dir: string, maxFiles = MAX_FILES_PER_DIR): Promise<StoredDoc[]> {
  const docs: StoredDoc[] = [];
  let entries: string[] = [];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return docs;
  }
  const files = entries.filter((e) => e.endsWith(".md")).slice(0, maxFiles);
  for (const file of files) {
    const full = path.join(dir, file);
    let content: string;
    try {
      content = await fs.readFile(full, "utf-8");
    } catch {
      continue;
    }
    if (content.length < 20) continue;
    docs.push({
      id: `note:${path.relative(CWD, full)}`,
      title: path.basename(file, ".md").replace(/[-_]+/g, " "),
      path: path.relative(CWD, full),
      content: content.slice(0, MAX_DOC_SIZE),
      kind: "note",
    });
  }
  return docs;
}

async function loadCardDocs(): Promise<StoredDoc[]> {
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
    content: `${c.title}. ${c.description} ${c.content}`.slice(0, MAX_DOC_SIZE),
    kind: "card" as const,
  }));
}

async function loadDeepDocs(): Promise<StoredDoc[]> {
  const docs: StoredDoc[] = [];
  for (const subject of SUBJECT_DIRS) {
    const root = path.join(KB_DEEP_ROOT, subject);
    for (const sub of SUBDIRS) {
      docs.push(...(await readMarkdownFiles(path.join(root, sub))));
    }
  }
  // top-level subject READMEs
  for (const subject of SUBJECT_DIRS) {
    docs.push(...(await readMarkdownFiles(path.join(KB_DEEP_ROOT, subject), 3)));
  }
  // student resources
  docs.push(...(await readMarkdownFiles(path.join(KB_DEEP_ROOT, "student-resources"), 10)));
  return docs;
}

async function loadRoadmapDocs(): Promise<StoredDoc[]> {
  const docs: StoredDoc[] = [];
  let roadmaps: string[] = [];
  try {
    roadmaps = await fs.readdir(path.join(KB_DEEP_ROOT, "roadmaps"));
  } catch {
    return docs;
  }
  let taken = 0;
  for (const rm of roadmaps) {
    if (taken >= MAX_ROADMAP_CONTENT) break;
    const contentDir = path.join(KB_DEEP_ROOT, "roadmaps", rm, "content");
    docs.push(...(await readMarkdownFiles(contentDir, 20)));
    taken += docs.length;
  }
  return docs.slice(0, MAX_ROADMAP_CONTENT);
}

let store: VectorStore | null = null;
let building: Promise<VectorStore> | null = null;

export function getVectorStore(): Promise<VectorStore> {
  if (store) return Promise.resolve(store);
  if (building) return building;
  building = (async () => {
    const vs = new VectorStore();
    const [cards, deep, roadmaps] = await Promise.all([
      loadCardDocs(),
      loadDeepDocs(),
      loadRoadmapDocs(),
    ]);
    vs.add([...cards, ...deep, ...roadmaps]);
    store = vs;
    return vs;
  })();
  return building;
}

export async function corpusStats(): Promise<{ size: number }> {
  const vs = await getVectorStore();
  return { size: vs.size };
}