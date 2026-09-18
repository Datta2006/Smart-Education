/**
 * Hybrid retrieval pipeline for /api/chat.
 *
 * Query path (per request, cheap): follow-up detection → dense (hashed
 * TF-IDF cosine) + keyword (BM25) candidates → Reciprocal Rank Fusion →
 * transparent reranking → top 3-5 chunks for the generator. Chunking and
 * embedding of the corpus never happen here.
 *
 * Every stage logs enough to see which chunks were retrieved and why
 * (KB_DEBUG=1 prints the full scored candidate table).
 */

import {
  embedText,
  cosine,
  tokenize,
  significantTerms,
  type IdfTable,
  type IndexedDoc,
} from "./vector-store";
import type { BuiltIndex } from "./index-file";

export interface RetrievalCandidate {
  doc: IndexedDoc;
  dense: number;
  bm25: number;
  rrf: number;
  rerank: number;
  breakdown: {
    rrfRank: number;
    titleHits: number;
    sectionHits: number;
    coverage: number;
    phrase: number;
    kindBoost: number;
  };
}

export interface RetrievalResult {
  query: string;
  /** The query actually used for retrieval (with context folded in if follow-up). */
  effectiveQuery: string;
  isFollowUp: boolean;
  candidates: RetrievalCandidate[];
  /** Final chunks for generation, best first. */
  top: RetrievalCandidate[];
}

const CANDIDATES_PER_RETRIEVER = 20;
const FINAL_TOP_K = 5;
// Max single-list RRF contribution is 1/(RRF_K+1) ≈ 0.0164; rank-1 in BOTH
// lists ≈ 0.0328. A confident answer typically surfaces in both lists
// (≥ rank ~5 each), so 0.024 rejects junk while keeping solid matches.
const MIN_RRF_FOR_ANSWER = 0.024;

const RRF_K = 60;
const BM25_K1 = 1.4;
const BM25_B = 0.72;
/** Max achievable RRF: rank-1 in both lists. Normalizes confidence into [0, 1]. */
const MAX_RRF = 2 / (RRF_K + 1);

const KIND_BOOST: Record<IndexedDoc["kind"], number> = {
  card: 0.06, // curated mentoring cards are the platform's own voice
  note: 0.03, // subject notes/tutorials are the core teaching material
  roadmap: 0.0, // allowlisted roadmap topics are neutral
};

const FOLLOWUP_MARKERS =
  /^(what|why|how|and |so |tell me more|more|explain|elaborate|expand|continue|go on|also|then|next|and then|what about|how about|can you (explain|expand|elaborate)|why (is|does|do)|give (me )?another|any (more|other)|difference between|compare)\b/i;

export function detectFollowUp(
  history: Array<{ role: string; content: string }>,
  message: string
): boolean {
  if (history.length === 0) return false;
  // Long questions are usually self-contained; only short ones benefit
  // from folding in conversational context.
  if (message.trim().split(/\s+/).length > 8) return false;
  return FOLLOWUP_MARKERS.test(message.trim());
}

/** Resolve a follow-up question against the recent conversation. */
export function resolveQuery(
  message: string,
  history: Array<{ role: string; content: string }>,
  isFollowUp: boolean
): string {
  if (!isFollowUp) return message;
  // Last 2 user messages + last bot answer give just enough topic context.
  const users = history.filter((m) => m.role === "user").slice(-2).map((m) => m.content);
  const bots = history.filter((m) => m.role === "bot").slice(-1).map((m) => m.content);
  return [...users, ...bots, message].join(" ").slice(-600);
}

/** Build a tiny BM25 index over the chunk term-frequencies (done once per index load). */
export function buildBm25(docs: IndexedDoc[]): {
  avgLen: number;
  docs: Array<{ tf: Map<string, number>; len: number }>;
} {
  let totalLen = 0;
  const out = docs.map((d) => {
    const tf = tokenize(d.content);
    totalLen += tf.length;
    const map = new Map<string, number>();
    for (const t of tf) map.set(t, (map.get(t) ?? 0) + 1);
    return { tf: map, len: tf.length };
  });
  return { avgLen: out.length ? totalLen / out.length : 1, docs: out };
}

function bm25Scores(
  bm25: { avgLen: number; docs: Array<{ tf: Map<string, number>; len: number }> },
  queryTerms: string[],
  idf: IdfTable,
  N: number
): number[] {
  const scores = new Array<number>(bm25.docs.length).fill(0);
  for (const qt of queryTerms) {
    const idfW = idf[qt] ?? Math.log(1 + N);
    for (let i = 0; i < bm25.docs.length; i++) {
      const f = bm25.docs[i].tf.get(qt);
      if (!f) continue;
      const { len } = bm25.docs[i];
      const denom = f + BM25_K1 * (1 - BM25_B + BM25_B * (len / bm25.avgLen));
      scores[i] += (idfW * f * (BM25_K1 + 1)) / denom;
    }
  }
  // Normalize to [0, 1]-ish so RRF isn't needed for scale; we use rank anyway.
  const max = Math.max(...scores, 1e-9);
  return scores.map((s) => s / max);
}

/**
 * Fuse ranked lists with Reciprocal Rank Fusion. `scoreOf` selects the
 * per-retriever score (dense cosine / normalized BM25) to record on the
 * candidate for logging and debugging.
 */
function rrfFuse(
  rankedLists: Array<{ kind: "dense" | "bm25"; items: Array<{ idx: number; score: number }> }>,
  candidatePool: Map<number, RetrievalCandidate>,
  docAt: (idx: number) => IndexedDoc
): void {
  for (const { kind, items } of rankedLists) {
    items.forEach(({ idx, score }, rank) => {
      const doc = docAt(idx);
      const contribution = 1 / (RRF_K + rank + 1);
      const existing = candidatePool.get(idx);
      if (existing) {
        existing.rrf += contribution;
        if (kind === "dense") existing.dense = Math.max(existing.dense, score);
        else existing.bm25 = Math.max(existing.bm25, score);
      } else {
        candidatePool.set(idx, {
          doc,
          dense: kind === "dense" ? score : 0,
          bm25: kind === "bm25" ? score : 0,
          rrf: contribution,
          rerank: 0,
          breakdown: {
            rrfRank: rank + 1,
            titleHits: 0,
            sectionHits: 0,
            coverage: 0,
            phrase: 0,
            kindBoost: 0,
          },
        });
      }
    });
  }
}

/**
 * Evidence gate: does this chunk have real retrieval evidence?
 *
 * RRF alone can't gate here: a single-list score maxes out at
 * 1/(RRF_K+1) ≈ 0.0164, so a strong BM25-only match (no dense overlap)
 * can never reach the two-list threshold. Instead we ask: does the chunk
 * carry explicit keyword engagement (title/section match), or do both
 * retrievers agree on it (fused RRF above the answer threshold)?
 */
function hasEvidence(c: RetrievalCandidate): boolean {
  if (c.breakdown.titleHits + c.breakdown.sectionHits > 0) return true;
  // 0.024 needs both lists: single-list max is 1/(RRF_K+1) ≈ 0.0164.
  return c.rrf >= MIN_RRF_FOR_ANSWER;
}

/** Normalized 0..1 retrieval confidence for a candidate. */
export function confidenceOf(c: RetrievalCandidate): number {
  return Math.min(1, c.rrf / MAX_RRF);
}

/**
 * Rerank: transparent additive scoring over fused candidates.
 * Signals: fusion rank, title matches, section matches, query-term
 * coverage, exact phrase match, kind boost.
 */
function rerank(cands: RetrievalCandidate[], queryTerms: string[], message: string): void {
  const msgLower = message.toLowerCase();

  for (const c of cands) {
    const { doc } = c;
    const titleLower = doc.title.toLowerCase();
    const sectionLower = (doc.section ?? "").toLowerCase();

    c.breakdown.titleHits = queryTerms.filter((t) => titleLower.includes(t)).length;
    // Section matches only count when they add information beyond the title
    // (chunks from heading-less docs have section === "" here).
    c.breakdown.sectionHits =
      sectionLower && sectionLower !== titleLower
        ? queryTerms.filter((t) => sectionLower.includes(t)).length
        : 0;

    const contentTerms = new Set(tokenize(doc.content));
    c.breakdown.coverage =
      queryTerms.length === 0
        ? 0
        : queryTerms.filter((t) => contentTerms.has(t)).length / queryTerms.length;

    c.breakdown.phrase =
      msgLower.length > 8 && doc.content.toLowerCase().includes(msgLower) ? 1 : 0;

    c.breakdown.kindBoost = KIND_BOOST[doc.kind];

    c.rerank =
      c.rrf * 40 + // fusion rank is the dominant signal
      c.breakdown.titleHits * 0.5 +
      c.breakdown.sectionHits * 0.25 +
      c.breakdown.coverage * 0.6 +
      c.breakdown.phrase * 1.5 +
      c.breakdown.kindBoost;
  }

  cands.sort((a, b) => b.rerank - a.rerank);
}

export interface Logger {
  debug?: (msg: string, ...args: unknown[]) => void;
}

/**
 * Run the full retrieval pipeline for one chat turn.
 *
 * @param message    the current user message
 * @param history    prior conversation (role/content), oldest first
 * @param index      the loaded (persisted or in-memory) index
 * @param bm25       BM25 structures built once per index load
 * @param debug      logger; pass console with KB_DEBUG=1 to see candidate tables
 */
export function retrieve(
  message: string,
  history: Array<{ role: string; content: string }>,
  index: BuiltIndex,
  bm25: ReturnType<typeof buildBm25>,
  debug?: Logger
): RetrievalResult {
  const isFollowUp = detectFollowUp(history, message);
  const effectiveQuery = resolveQuery(message, history, isFollowUp);
  const queryTerms = significantTerms(effectiveQuery);

  // --- dense retrieval -----------------------------------------------------
  const q = embedText(effectiveQuery, index.idf);
  const denseRanked: Array<{ idx: number; score: number }> = [];
  for (let i = 0; i < index.docs.length; i++) {
    const score = cosine(q, index.docs[i].vec);
    if (score > 0.04) denseRanked.push({ idx: i, score });
  }
  denseRanked.sort((a, b) => b.score - a.score);
  const denseTop = denseRanked.slice(0, CANDIDATES_PER_RETRIEVER);

  // --- keyword (BM25) retrieval -------------------------------------------
  const bm25ScoresArr = bm25Scores(bm25, queryTerms, index.idf, index.docs.length);
  const bm25Ranked = bm25ScoresArr
    .map((score, idx) => ({ idx, score }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, CANDIDATES_PER_RETRIEVER);

  // --- fuse (RRF) -----------------------------------------------------------
  const pool = new Map<number, RetrievalCandidate>();
  rrfFuse(
    [
      { kind: "dense", items: denseTop },
      { kind: "bm25", items: bm25Ranked },
    ],
    pool,
    (i) => index.docs[i]
  );

  const candidates = [...pool.values()];
  rerank(candidates, queryTerms, message);

  // Evidence floor: a chunk reaches the answer set only if it has real
  // retrieval evidence — genuine keyword engagement (title/section hits)
  // or agreement between both retrievers. Cuts dense-only noise (trigram
  // coincidences) and tail BM25 debris.
  const candidatesEligible = candidates.filter((c) => hasEvidence(c));
  const top = candidatesEligible.slice(0, FINAL_TOP_K);
  const best = top[0] ?? candidates[0];

  // --- debug logging --------------------------------------------------------
  debug?.debug?.(
    `[retrieval] q="${message.slice(0, 80)}" followUp=${isFollowUp} effective="${effectiveQuery.slice(0, 100)}" candidates=${candidates.length}`
  );
  for (const c of candidates.slice(0, 8)) {
    debug?.debug?.(
      `[retrieval]   ${c.rerank.toFixed(3)} rrf=${c.rrf.toFixed(4)} dense=${c.dense.toFixed(3)} bm25=${c.bm25.toFixed(3)} ` +
        `[${c.doc.kind}] "${c.doc.title}" :: ${c.doc.section ?? "-"} ` +
        `title=${c.breakdown.titleHits} cov=${c.breakdown.coverage.toFixed(2)}`
    );
  }

  // Confidence = evidence, not raw RRF: a strong BM25-only match would
  // otherwise be rejected by a threshold only two-list fusion can reach.
  const confident = Boolean(best && hasEvidence(best));
  return {
    query: message,
    effectiveQuery,
    isFollowUp,
    candidates,
    top: confident ? top : [],
  };
}

export const RETRIEVAL_CONFIG = {
  CANDIDATES_PER_RETRIEVER,
  FINAL_TOP_K,
  MIN_RRF_FOR_ANSWER,
  RRF_K,
  BM25_K1,
  BM25_B,
};
