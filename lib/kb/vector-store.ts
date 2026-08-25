/**
 * Local vector store — no ML, no external API.
 *
 * Documents are embedded with hashed character n-grams + word tokens,
 * weighted by term frequency and L2-normalized. Retrieval is cosine
 * similarity against the query embedding. Good enough to rank KB
 * snippets, tiny enough to run anywhere.
 */

export interface StoredDoc {
  id: string;
  title: string;
  path: string;
  content: string;
  kind: "card" | "note" | "roadmap";
}

export interface ScoredDoc extends StoredDoc {
  score: number;
}

const DIM = 256;
const STOPWORDS = new Set(
  "a an and are as at be but by for from have has how i if in into is it its of on or that the their then there they this to was we what when where which who will with you your".split(
    " "
  )
);

const SEED1 = 0x9e3779b9;
const SEED2 = 0x85ebca6b;

function hash32(str: string, seed: number): number {
  let h1 = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h1 = Math.imul(h1 ^ str.charCodeAt(i), 2654435761);
    h1 = (h1 << 13) | (h1 >>> 19);
  }
  return h1 >>> 0;
}

function embedText(text: string): Float32Array {
  const vec = new Float32Array(DIM);
  const lower = text.toLowerCase();
  const terms = lower.split(/[^a-z0-9]/).filter((t) => t.length >= 3 && !STOPWORDS.has(t));

  const freq = new Map<string, number>();
  for (const term of terms) freq.set(term, (freq.get(term) ?? 0) + 1);

  // word-level terms
  for (const [term, count] of freq) {
    const weight = 1 + Math.log(count);
    for (const seed of [SEED1, SEED2, 0x7f4a7c15]) {
      vec[hash32(term, seed) % DIM] += weight;
    }
  }

  // character trigrams capture prefixes/typos/structure even in tiny docs
  const chars = lower.replace(/[^a-z0-9]/g, "");
  for (let i = 0; i < chars.length - 2; i += 1) {
    const tri = chars.slice(i, i + 3);
    vec[hash32("t" + tri, SEED1) % DIM] += 1;
  }

  const norm = Math.sqrt(vec.reduce((a, v) => a + v * v, 0)) || 1;
  for (let i = 0; i < DIM; i++) vec[i] /= norm;
  return vec;
}

export class VectorStore {
  private docs: StoredDoc[] = [];
  private vectors: Float32Array[] = [];
  private built = false;

  get size() {
    return this.docs.length;
  }

  add(docs: StoredDoc[]) {
    for (const doc of docs) {
      if (!doc.content || doc.content.length < 20) continue;
      this.docs.push(doc);
      this.vectors.push(embedText(doc.content));
    }
  }

  /** Embed a query and return the top-k docs by cosine similarity. */
  search(query: string, k = 6): ScoredDoc[] {
    if (this.docs.length === 0) return [];
    const q = embedText(query);
    const scored: Array<{ doc: StoredDoc; score: number }> = [];
    for (let i = 0; i < this.docs.length; i++) {
      let dot = 0;
      const v = this.vectors[i];
      for (let j = 0; j < DIM; j++) dot += q[j] * v[j];
      scored.push({ doc: this.docs[i], score: dot });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored
      .filter((s) => s.score > 0.08)
      .slice(0, k)
      .map((s) => ({ ...s.doc, score: s.score }));
  }
}

export function significantTerms(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

export function scoreSnippet(snippet: string, terms: string[]): number {
  const lower = snippet.toLowerCase();
  return terms.reduce((sum, t) => (lower.includes(t) ? sum + 1 : sum), 0);
}

/**
 * Extract the most relevant 1-3 sentences / bullets from a chunk for a query.
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