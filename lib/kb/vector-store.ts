/**
 * Local vector store — no ML, no external API, fully self-hostable.
 *
 * "Embeddings" are sparse hashed TF-IDF vectors: word tokens (IDF-weighted
 * against a corpus-specific table) + character trigrams for typo/prefix
 * tolerance, folded into a fixed 384-dim space via a single hash, then
 * int8-quantized for compact persistence. Retrieval is cosine similarity.
 *
 * IDFs live with the index (see lib/kb/index-file.ts) — built offline by
 * scripts/build-kb-index.ts, or on the fly by the in-memory fallback in
 * lib/kb/corpus.ts. Embedding is a pure function of (text, idf) so the
 * build-time and query-time paths stay identical.
 */

export interface StoredDoc {
  id: string;
  title: string;
  path: string;
  content: string;
  kind: "card" | "note" | "roadmap";
  /** Heading/section this chunk came from (empty for cards). */
  section?: string;
}

export interface ScoredDoc extends StoredDoc {
  /** Search results strip the raw vector to keep payloads small. */
  vec?: undefined;
  score: number;
}

export const EMBED_DIM = 384;
export const EMBED_VERSION = 3;

const SEED = 0x9e3779b9;

export const STOPWORDS = new Set(
  "a an and are as at be been being but by for from had has have how i if in into is it its of on or that the their then there these they this to was we were what when where which who will with you your".split(
    " "
  )
);

export function hash32(str: string, seed = SEED): number {
  let h1 = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h1 = Math.imul(h1 ^ str.charCodeAt(i), 2654435761);
    h1 = (h1 << 13) | (h1 >>> 19);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 = Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h1 ^ (h1 >>> 16)) >>> 0;
}

/** Tokenize into normalized, stopword-filtered terms. */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2 && t.length <= 32 && !STOPWORDS.has(t));
}

export function significantTerms(query: string): string[] {
  return tokenize(query);
}

/** Term frequency map for a text. */
export function termFreq(text: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const t of tokenize(text)) freq.set(t, (freq.get(t) ?? 0) + 1);
  return freq;
}

export type IdfTable = Record<string, number>;

/** Smoothed IDF from document frequencies: ln(1 + N/df). */
export function buildIdfTable(docFreqs: Record<string, number>, totalDocs: number): IdfTable {
  const idf: IdfTable = {};
  for (const [term, df] of Object.entries(docFreqs)) {
    idf[term] = Math.log(1 + totalDocs / Math.max(1, df));
  }
  return idf;
}

const DEFAULT_IDF = Math.log(1 + 1); // unseen term — rare, so moderately important
const TRIGRAM_IDF = 0.8; // char trigrams are dense; damp them so words dominate
const MAX_TRIGRAMS = 600;

/**
 * Sparse embedded representation: (dimension, weight) pairs over the
 * EMBED_DIM space, already L2-normalized.
 */
export type SparseVector = Array<[number, number]>;

export function embedText(text: string, idf: IdfTable): SparseVector {
  const vec = new Float32Array(EMBED_DIM);
  const freq = termFreq(text);

  // IDF-weighted word terms.
  for (const [term, count] of freq) {
    const w = (1 + Math.log(count)) * (idf[term] ?? DEFAULT_IDF);
    vec[hash32("w" + term) % EMBED_DIM] += w;
  }

  // Character trigrams — damped, capped so huge chunks don't drown words.
  const chars = text.toLowerCase().replace(/[^a-z0-9]+/g, "");
  let trigrams = 0;
  for (let i = 0; i + 2 < chars.length && trigrams < MAX_TRIGRAMS; i += 1) {
    vec[hash32("t" + chars.slice(i, i + 3)) % EMBED_DIM] += TRIGRAM_IDF;
    trigrams += 1;
  }

  let norm = 0;
  for (let i = 0; i < EMBED_DIM; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;

  const out: SparseVector = [];
  for (let i = 0; i < EMBED_DIM; i++) {
    if (vec[i] !== 0) out.push([i, vec[i] / norm]);
  }
  return out;
}

/** int8 quantization for persisted vectors: value/weight pairs, 2 decimal u. */
export function quantize(vec: SparseVector): Array<[number, number]> {
  return vec.map(([d, w]) => [d, Math.round(w * 127)] as [number, number]);
}

export function dequantize(vec: Array<[number, number]>): SparseVector {
  return vec.map(([d, w]) => [d, w / 127] as [number, number]);
}

export function cosine(a: SparseVector, b: SparseVector): number {
  let i = 0;
  let j = 0;
  let dot = 0;
  while (i < a.length && j < b.length) {
    if (a[i][0] === b[j][0]) {
      dot += a[i][1] * b[j][1];
      i++;
      j++;
    } else if (a[i][0] < b[j][0]) {
      i++;
    } else {
      j++;
    }
  }
  return dot;
}

export interface IndexedDoc extends StoredDoc {
  vec: SparseVector;
}

/**
 * In-memory vector store. Documents + vectors are supplied by the caller
 * (persisted index or in-memory fallback); queries embed on demand.
 */
export class VectorStore {
  private docs: IndexedDoc[] = [];

  constructor(docs: IndexedDoc[] = []) {
    this.docs = docs;
  }

  get size() {
    return this.docs.length;
  }

  /** Top-k docs by cosine similarity above a minimum score. */
  search(query: string, k = 6, minScore = 0.05, idf: IdfTable = {}): ScoredDoc[] {
    if (this.docs.length === 0) return [];
    const q = embedText(query, idf);
    const scored: ScoredDoc[] = [];
    for (const d of this.docs) {
      const score = cosine(q, d.vec);
      if (score > minScore) scored.push({ ...d, vec: undefined, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
  }
}

export function scoreSnippet(snippet: string, terms: string[]): number {
  const lower = snippet.toLowerCase();
  return terms.reduce((sum, t) => (lower.includes(t) ? sum + 1 : sum), 0);
}

/**
 * Extract the most relevant 1-2 sentences/bullets from a chunk for a query.
 * Falls back to a trimmed head when nothing matches.
 */
export function extractRelevant(chunk: string, terms: string[], maxLen = 260): string {
  const blocks = chunk
    .split(/\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  let best: string[] = [];
  let bestScore = -1;
  for (const block of blocks) {
    const score = scoreSnippet(block, terms);
    if (score > bestScore) {
      bestScore = score;
      best = [block];
    } else if (score === bestScore && score > 0 && best.length < 2) {
      best.push(block);
    }
  }

  const source = bestScore > 0 ? best.join(" ") : blocks.slice(0, 2).join(" ");
  const cleaned = source
    .replace(/[#*`>_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}
