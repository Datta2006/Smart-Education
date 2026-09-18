/**
 * Offline KB ingestion: build the persisted retrieval index.
 *
 *   npm run kb:build              # incremental — skips when nothing changed
 *   npm run kb:build -- --force   # rebuild even if fingerprint matches
 *
 * Pipeline: collect sources (cards + subject notes + allowlisted roadmap
 * topics) → clean → heading-aware chunks → IDF → hashed TF-IDF embeddings
 * (int8) → kb/index/kb-index.json. Never runs per user query.
 */

import fs from "fs/promises";
import path from "path";
import { collectSources } from "../lib/kb/sources";
import { chunkDoc, type RawSourceDoc } from "../lib/kb/chunker";
import {
  INDEX_FILE,
  INDEX_FORMAT,
  fingerprintSources,
  fingerprintsEqual,
  buildIndexFromChunks,
  writeIndex,
  readIndex,
  type KbIndexFile,
  type SourceStat,
} from "../lib/kb/index-file";
import { EMBED_VERSION, EMBED_DIM, quantize } from "../lib/kb/vector-store";

const CWD = process.cwd();
const SCAN_ROOTS = ["content/kb", "kb/knowledge-base"];

async function statSources(): Promise<SourceStat[]> {
  const stats: SourceStat[] = [];
  const stack = SCAN_ROOTS.map((r) => path.join(CWD, r));

  while (stack.length > 0) {
    const dir = stack.pop()!;
    let entries: string[] = [];
    try {
      entries = await fs.readdir(dir);
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry);
      let st;
      try {
        st = await fs.stat(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) stack.push(full);
      // fingerprint everything readable; only .md/.txt are ingested, but
      // PDFs etc. changing should still mark the index stale-conservative
      else if (st.isFile() && st.size < 32 * 1024 * 1024) {
        stats.push({ path: path.relative(CWD, full), size: st.size, mtimeMs: st.mtimeMs });
      }
    }
  }
  return stats;
}

async function main() {
  const force = process.argv.includes("--force");
  const started = Date.now();

  console.log("[kb:build] collecting sources…");
  const [sources, stats] = await Promise.all([collectSources(), statSources()]);
  const fingerprint = fingerprintSources(stats);

  if (!force) {
    const existing = await readIndex();
    if (existing && fingerprintsEqual(existing.fingerprint, fingerprint)) {
      console.log(
        `[kb:build] index is up to date (${existing.stats.chunks} chunks, built ${existing.builtAt}). Use --force to rebuild.`
      );
      return;
    }
  }

  console.log(`[kb:build] ${sources.length} source docs`);

  const chunks = sources.flatMap((s: RawSourceDoc) => chunkDoc(s));
  console.log(`[kb:build] ${chunks.length} chunks`);

  const buildMs = Date.now() - started;
  const built = buildIndexFromChunks(chunks, fingerprint, buildMs);

  const file: KbIndexFile = {
    format: INDEX_FORMAT,
    embedVersion: EMBED_VERSION,
    embedDim: EMBED_DIM,
    builtAt: new Date().toISOString(),
    stats: {
      sources: sources.length,
      chunks: chunks.length,
      buildMs,
    },
    fingerprint,
    docFreq: docFreqOf(chunks),
    totalDocs: chunks.length,
    chunks: chunks.map((c, i) => ({
      id: c.id,
      title: c.title,
      path: c.path,
      kind: c.kind,
      section: c.section,
      part: c.part,
      sourceHash: c.sourceHash,
      content: c.content,
      vec: quantize(built.docs[i].vec),
    })),
  };

  await writeIndex(file);

  const sizeMb = (await fs.stat(INDEX_FILE)).size / (1024 * 1024);
  console.log(
    `[kb:build] wrote ${INDEX_FILE}: ${chunks.length} chunks from ${sources.length} sources ` +
      `in ${(buildMs / 1000).toFixed(1)}s (${sizeMb.toFixed(1)} MB)`
  );
}

function docFreqOf(chunks: ReturnType<typeof chunkDoc>): Record<string, number> {
  const df: Record<string, number> = {};
  for (const c of chunks) {
    // termFreq returns a Map, so iterate its entries and take the key.
    for (const [term] of tokenizeForDf(c.content)) {
      df[term] = (df[term] ?? 0) + 1;
    }
  }
  return df;
}

// Use the same tokenizer as the embedder for consistent DF counts.
import { termFreq as tokenizeForDf } from "../lib/kb/vector-store";

main().catch((err) => {
  console.error("[kb:build] failed:", err);
  process.exit(1);
});
