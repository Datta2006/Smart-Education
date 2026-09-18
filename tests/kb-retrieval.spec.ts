import { describe, it, expect } from "vitest";
import {
  buildIndexFromChunks,
  hydrateIndex,
  fingerprintsEqual,
  fingerprintSources,
} from "../lib/kb/index-file";
import { retrieve, buildBm25, detectFollowUp, confidenceOf } from "../lib/kb/retrieval";
import { chunkDoc } from "../lib/kb/chunker";
import type { RawSourceDoc } from "../lib/kb/chunker";

const doc = (id: string, title: string, body: string, kind: RawSourceDoc["kind"] = "note"): RawSourceDoc => ({
  id,
  title,
  path: `kb/knowledge-base/${id}.md`,
  content: body,
  kind,
});

const sources: RawSourceDoc[] = [
  doc(
    "recursion",
    "Introduction to Recursion",
    `# Introduction to Recursion\n\nRecursion is a technique where a function calls itself to solve smaller instances of the same problem.\n\n## Base Case\n\nEvery recursive function needs a base case to stop, otherwise it overflows the stack.\n\n## Fibonacci\n\nThe fibonacci function is the classic recursion example but recomputes overlapping subproblems, which is why dynamic programming is needed.`
  ),
  doc(
    "sql-joins",
    "SQL Joins",
    `# SQL Joins\n\nA join combines rows from two tables using a related column.\n\n## Inner Join\n\nAn inner join keeps only matching rows from both tables.\n\n## Left Join\n\nA left join keeps every row from the left table and null-fills missing right columns.`
  ),
  doc(
    "os-page-replacement",
    "Page Replacement Algorithms",
    `# Page Replacement Algorithms\n\nWhen a page fault occurs and memory is full, the OS must evict a page.\n\n## LRU\n\nLeast recently used evicts the page that has not been used for the longest time.\n\n## FIFO\n\nFirst in first out evicts the oldest page regardless of use.`
  ),
  doc("card-mentor", "Feeling Behind In Year 1", `${"Consistency beats early starts. ".repeat(12)}`, "card"),
];

function buildIndex() {
  const chunks = sources.flatMap((s) => chunkDoc(s));
  const built = buildIndexFromChunks(chunks, { files: {} }, 0);
  return { built, chunks };
}

describe("index-file", () => {
  it("builds and hydrates a queryable index", () => {
    const { built } = buildIndex();
    expect(built.docs.length).toBeGreaterThan(3);
    expect(Object.keys(built.idf).length).toBeGreaterThan(10);

    const file = {
      format: 1 as const,
      embedVersion: 3,
      embedDim: 384,
      builtAt: new Date().toISOString(),
      stats: { sources: sources.length, chunks: built.docs.length, buildMs: 1 },
      fingerprint: built.fingerprint,
      docFreq: {},
      totalDocs: 0,
      chunks: built.docs.map((d) => ({
        id: d.id,
        title: d.title,
        path: d.path,
        kind: d.kind,
        section: d.section ?? "",
        part: 0,
        sourceHash: 0,
        content: d.content,
        vec: d.vec.map(([dim, w]) => [dim, Math.round(w * 127)] as [number, number]),
      })),
    };
    file.docFreq = Object.fromEntries(
      Object.entries(built.idf).map(([t, w]) => [t, Math.max(1, Math.round(Math.exp(w) * 1))])
    );
    file.totalDocs = built.docs.length;

    const hydrated = hydrateIndex(file);
    expect(hydrated.docs.length).toBe(built.docs.length);
    // Hydrated vectors should still rank the same doc first.
    const bm25 = buildBm25(hydrated.docs);
    const r = retrieve("how does recursion work", [], hydrated, bm25);
    expect(r.top[0]?.doc.title.toLowerCase()).toContain("recursion");
  });

  it("detects fingerprint changes", () => {
    const a = fingerprintSources([{ path: "a.md", size: 10, mtimeMs: 1 }]);
    const b = fingerprintSources([{ path: "a.md", size: 11, mtimeMs: 1 }]);
    const c = fingerprintSources([{ path: "a.md", size: 10, mtimeMs: 1 }]);
    expect(fingerprintsEqual(a, b)).toBe(false);
    expect(fingerprintsEqual(a, c)).toBe(true);
  });
});

describe("retrieval", () => {
  it("ranks the on-topic chunk first for a keyword query", () => {
    const { built } = buildIndex();
    const bm25 = buildBm25(built.docs);
    const r = retrieve("what is an inner join in sql", [], built, bm25);
    expect(r.top.length).toBeGreaterThan(0);
    expect(r.top[0].doc.title).toBe("SQL Joins");
    expect(r.top[0].doc.section).toBe("Inner Join");
  });

  it("prefers notes over generic cards for technical queries", () => {
    const { built } = buildIndex();
    const bm25 = buildBm25(built.docs);
    const r = retrieve("lru page replacement", [], built, bm25);
    expect(r.top[0].doc.title).toBe("Page Replacement Algorithms");
  });

  it("folds conversation context into follow-up questions", () => {
    const history = [
      { role: "user", content: "explain recursion in dsa" },
      { role: "bot", content: "Recursion is a function calling itself..." },
    ];
    expect(detectFollowUp(history, "what about its base case?")).toBe(true);
    expect(detectFollowUp(history, "What is a left join in sql? This is a full standalone question about databases.")).toBe(false);

    const { built } = buildIndex();
    const bm25 = buildBm25(built.docs);
    const r = retrieve("what about its base case?", history, built, bm25);
    expect(r.isFollowUp).toBe(true);
    expect(r.effectiveQuery.toLowerCase()).toContain("recursion");
    expect(r.top[0].doc.title.toLowerCase()).toContain("recursion");
  });

  it("rejects gibberish instead of returning junk chunks", () => {
    const { built } = buildIndex();
    const bm25 = buildBm25(built.docs);
    const r = retrieve("zzzqqq xxxyyy wwoff", [], built, bm25);
    expect(r.top).toHaveLength(0);
  });

  it("exposes a normalized 0..1 confidence", () => {
    const { built } = buildIndex();
    const bm25 = buildBm25(built.docs);
    const r = retrieve("sql join", [], built, bm25);
    const conf = confidenceOf(r.top[0]);
    expect(conf).toBeGreaterThan(0);
    expect(conf).toBeLessThanOrEqual(1);
  });
});
