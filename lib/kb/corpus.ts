import "server-only";
import { readIndex, hydrateIndex, buildIndexFromChunks, fingerprintsEqual, INDEX_FILE, type BuiltIndex, type SourceFingerprint } from "./index-file";
import { chunkDoc, type RawSourceDoc } from "./chunker";
import { buildBm25 } from "./retrieval";
import { collectSources } from "./sources";

/**
 * Server-side retrieval index for /api/chat.
 *
 * Loads the persisted index (kb/index/kb-index.json, built offline by
 * `npm run kb:build`) and caches it in memory. Chunking + embedding are
 * never done per query; the in-memory fallback below only runs when the
 * persisted index is missing/stale-format, so dev stays unbroken.
 */

interface RetrievalCache {
  index: BuiltIndex;
  bm25: ReturnType<typeof buildBm25>;
  fingerprint: SourceFingerprint;
}

let cached: RetrievalCache | null = null;
let loading: Promise<RetrievalCache> | null = null;

function chunkAll(sources: RawSourceDoc[]): ReturnType<typeof chunkDoc> {
  const chunks = sources.flatMap((s) => chunkDoc(s));
  if (process.env.KB_DEBUG) {
    console.log(`[corpus] chunked ${sources.length} sources → ${chunks.length} chunks`);
  }
  return chunks;
}

async function loadOnce(): Promise<RetrievalCache> {
  const persisted = await readIndex();
  if (persisted) {
    const index = hydrateIndex(persisted);
    cached = { index, bm25: buildBm25(index.docs), fingerprint: persisted.fingerprint };
    if (process.env.KB_DEBUG) {
      console.log(
        `[corpus] loaded persisted index ${INDEX_FILE}: ${index.stats.chunks} chunks, built ${persisted.builtAt}`
      );
    }
    return cached;
  }

  // Fallback: build in memory (dev convenience — logs a warning; the
  // persisted index is always preferred in production).
  console.warn(
    `[corpus] persisted index missing or stale (${INDEX_FILE}). Building in memory — run \`npm run kb:build\` for a persistent, fast-start index.`
  );
  const started = Date.now();
  const sources = await collectSources();
  const chunks = chunkAll(sources);
  const fingerprint = { files: {} };
  const index = buildIndexFromChunks(chunks, fingerprint, Date.now() - started);
  cached = { index, bm25: buildBm25(index.docs), fingerprint };
  return cached;
}

export function getRetrievalIndex(): Promise<RetrievalCache> {
  if (cached) return Promise.resolve(cached);
  if (loading) return loading;
  loading = loadOnce().finally(() => {
    loading = null;
  });
  return loading;
}

/** Used by admin/KB tooling to report whether the index is up to date. */
export async function isIndexStale(currentFingerprint: SourceFingerprint): Promise<boolean> {
  const { fingerprint } = await getRetrievalIndex();
  return !fingerprintsEqual(fingerprint, currentFingerprint);
}

export async function corpusStats(): Promise<{ size: number }> {
  const { index } = await getRetrievalIndex();
  return { size: index.docs.length };
}
