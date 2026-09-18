/**
 * Persistence layer for the retrieval index: kb/index/kb-index.json.
 *
 * The index is built OFFLINE by `npm run kb:build` (chunk + embed is
 * expensive) and loaded at request time. A fingerprint over every source
 * file (size + mtime) lets the build skip work when nothing changed, and
 * lets the runtime warn when the index is stale instead of silently
 * regenerating per query.
 */

import fs from "fs/promises";
import path from "path";
import {
  EMBED_DIM,
  EMBED_VERSION,
  buildIdfTable,
  dequantize,
  termFreq,
  type IdfTable,
  type IndexedDoc,
  type SparseVector,
} from "./vector-store";
import type { Chunk } from "./chunker";

const CWD = process.cwd();
export const INDEX_DIR = path.join(CWD, "kb", "index");
export const INDEX_FILE = path.join(INDEX_DIR, "kb-index.json");

export const INDEX_FORMAT = 1;

export interface SourceFingerprint {
  /** path → `${size}:${mtimeMs}` */
  files: Record<string, string>;
}

export interface KbIndexFile {
  format: typeof INDEX_FORMAT;
  embedVersion: number;
  embedDim: number;
  builtAt: string;
  /** Build duration stats, for the log line. */
  stats: {
    sources: number;
    chunks: number;
    buildMs: number;
  };
  fingerprint: SourceFingerprint;
  /** term → document frequency (for IDF at query time). */
  docFreq: Record<string, number>;
  totalDocs: number;
  chunks: Array<{
    id: string;
    title: string;
    path: string;
    kind: "card" | "note" | "roadmap";
    section?: string;
    part: number;
    sourceHash: number;
    content: string;
    /** int8-quantized sparse embedding. */
    vec: Array<[number, number]>;
  }>;
}

export interface SourceStat {
  path: string;
  size: number;
  mtimeMs: number;
}

/** Fingerprint a list of source files: path → "size:mtimeMs". */
export function fingerprintSources(stats: SourceStat[]): SourceFingerprint {
  const files: Record<string, string> = {};
  for (const s of stats) files[s.path] = `${s.size}:${Math.round(s.mtimeMs)}`;
  return { files };
}

export function fingerprintsEqual(a: SourceFingerprint, b: SourceFingerprint): boolean {
  const ka = Object.keys(a.files);
  const kb = Object.keys(b.files);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (a.files[k] !== b.files[k]) return false;
  }
  return true;
}

export interface BuiltIndex {
  docs: IndexedDoc[];
  idf: IdfTable;
  fingerprint: SourceFingerprint;
  stats: { sources: number; chunks: number; buildMs: number };
}

/** Assemble a BuiltIndex from chunks (shared by script + fallback). */
export function buildIndexFromChunks(
  chunks: Chunk[],
  fingerprint: SourceFingerprint,
  buildMs: number
): BuiltIndex {
  const docFreq: Record<string, number> = {};
  for (const c of chunks) {
    for (const term of termFreq(c.content).keys()) {
      docFreq[term] = (docFreq[term] ?? 0) + 1;
    }
  }
  const idf = buildIdfTable(docFreq, chunks.length);

  // Second pass: embed with the now-available IDF table.
  const { embedText } = vectorStoreRef;
  const docs: IndexedDoc[] = chunks.map((c) => ({
    id: c.id,
    title: c.title,
    path: c.path,
    content: c.content,
    kind: c.kind,
    section: c.section,
    vec: embedText(c.content, idf),
  }));

  return { docs, idf, fingerprint, stats: { sources: 0, chunks: chunks.length, buildMs } };
}

// Avoid a circular import at module-eval time: vector-store has no imports.
import * as vectorStoreRef from "./vector-store";

export async function writeIndex(index: KbIndexFile): Promise<void> {
  await fs.mkdir(INDEX_DIR, { recursive: true });
  await fs.writeFile(INDEX_FILE, JSON.stringify(index));
}

export async function readIndex(): Promise<KbIndexFile | null> {
  try {
    const raw = await fs.readFile(INDEX_FILE, "utf-8");
    const parsed = JSON.parse(raw) as KbIndexFile;
    if (
      parsed?.format !== INDEX_FORMAT ||
      parsed?.embedVersion !== EMBED_VERSION ||
      parsed?.embedDim !== EMBED_DIM
    ) {
      return null; // stale format — caller decides to rebuild
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Hydrate a persisted index file into a ready-to-query BuiltIndex. */
export function hydrateIndex(file: KbIndexFile): BuiltIndex {
  const idf = buildIdfTable(file.docFreq, file.totalDocs);
  const docs: IndexedDoc[] = file.chunks.map((c) => ({
    id: c.id,
    title: c.title,
    path: c.path,
    content: c.content,
    kind: c.kind,
    section: c.section,
    vec: dequantize(c.vec) as SparseVector,
  }));
  return { docs, idf, fingerprint: file.fingerprint, stats: file.stats };
}
