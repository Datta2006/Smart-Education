/**
 * Cleaning, normalization and heading-aware semantic chunking for the KB.
 *
 * Runs OFFLINE (scripts/build-kb-index.ts) or in the in-memory fallback —
 * never per user query. Markdown is converted to plain text, boilerplate
 * (resource link lists) is dropped, and documents are split on headings
 * into overlapping chunks small enough for focused retrieval. Every chunk
 * keeps rich metadata for citation and filtering.
 */

import type { StoredDoc } from "./vector-store";

export interface RawSourceDoc {
  /** Stable id of the source file/card. */
  id: string;
  title: string;
  /** Project-relative path (or virtual path for cards). */
  path: string;
  content: string;
  kind: "card" | "note" | "roadmap";
}

export interface Chunk extends StoredDoc {
  /** Position of the chunk within its source doc. */
  part: number;
  /** Fingerprint of the source content, for incremental rebuilds. */
  sourceHash: number;
}

const TARGET_CHARS = 900;
const OVERLAP_LINES = 2;
const MAX_CHUNK_CHARS = 1400;
const MIN_CHUNK_CHARS = 60;

/** Link-list boilerplate at the end of roadmap stubs (marker line → end). */
const RESOURCE_TAIL =
  /\n[ \t]*(?:#{1,6}[ \t]*)?(?:visit the following resources|related resources|further reading|resources to learn more|additional resources)[^\n]*\n[\s\S]*$/i;

/** Normalize raw markdown/text into clean plain text. */
export function cleanText(raw: string): string {
  let text = raw;

  // Strip frontmatter if present (cards are already parsed, but be safe).
  text = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");

  // Drop resource-link tails before general cleanup.
  text = text.replace(RESOURCE_TAIL, "\n");

  const lines = text.split(/\r?\n/);
  const out: string[] = [];
  let inFence = false;

  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      inFence = !inFence;
      continue; // drop code fences entirely — code rarely helps semantic search
    }
    if (!inFence) {
      // Markdown decoration → readable text.
      let l = line.replace(/!\[[^\]]*\]\([^)]*\)/g, ""); // images
      l = l.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1"); // links → anchor text
      l = l.replace(/^[\s>*-]+$/, ""); // bare rules/quotes/bullets
      if (l.trim()) out.push(l.trimEnd());
    }
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

interface Section {
  heading: string;
  body: string;
}

/** Split cleaned text into (heading, body) sections on markdown headings.
 * Content under the h1 (== doc title) is doc-level, so its section is "". */
function splitSections(text: string): Section[] {
  const lines = text.split("\n");
  const sections: Section[] = [];
  let heading = "";
  let buf: string[] = [];

  const flush = () => {
    const body = buf.join("\n").trim();
    if (body) sections.push({ heading, body });
    buf = [];
  };

  for (const line of lines) {
    const m = /^(#{1,4})\s+(.*)$/.exec(line);
    if (m) {
      flush();
      // Keep the readable heading text only. A level-1 heading is the doc
      // title itself — content under it is doc-level, not a named section.
      heading = m[1].length === 1 ? "" : m[2].replace(/[#*`]/g, "").trim();
    } else {
      buf.push(line);
    }
  }
  flush();

  return sections;
}

/** Split a very long line (PDF text dumps have none) into sentence-ish lines. */
function explodeLongLines(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    if (line.length <= TARGET_CHARS) {
      out.push(line);
      continue;
    }
    const sentences = line.split(/(?<=[.!?])\s+/);
    let buf = "";
    for (const s of sentences) {
      // A single "sentence" without punctuation (common in PDF dumps) gets
      // hard-split by words so no line exceeds the target.
      if (s.length > TARGET_CHARS) {
        if (buf) {
          out.push(buf);
          buf = "";
        }
        const words = s.split(/\s+/);
        let wbuf = "";
        for (const w of words) {
          if (wbuf && wbuf.length + w.length + 1 > TARGET_CHARS) {
            out.push(wbuf);
            wbuf = w;
          } else {
            wbuf = wbuf ? `${wbuf} ${w}` : w;
          }
        }
        if (wbuf) out.push(wbuf);
        continue;
      }
      if (buf && buf.length + s.length + 1 > TARGET_CHARS) {
        out.push(buf);
        buf = s;
      } else {
        buf = buf ? `${buf} ${s}` : s;
      }
    }
    if (buf) out.push(buf);
  }
  return out;
}

/** Greedy line-packing of a section body into target-sized chunks. */
function packBody(body: string): string[] {
  const lines = explodeLongLines(body.split("\n"));
  const chunks: string[] = [];
  let cur: string[] = [];
  let len = 0;

  const flushCur = () => {
    const joined = cur.join("\n").trim();
    if (joined.length >= MIN_CHUNK_CHARS) chunks.push(joined);
    cur = [];
    len = 0;
  };

  let prevTail: string[] = [];
  for (const line of lines) {
    if (len + line.length > TARGET_CHARS && len > 0) {
      flushCur();
      // Seed the new chunk with the previous chunk's tail lines so answers
      // that straddle a split still retrieve complete context.
      cur = prevTail.slice();
      len = cur.join("\n").length + 1;
    }
    cur.push(line);
    len += line.length + 1;
    prevTail = cur.slice(-OVERLAP_LINES);
  }
  flushCur();

  // A section too small to stand alone gets merged into the previous chunk.
  const merged: string[] = [];
  for (const c of chunks) {
    const prev = merged[merged.length - 1];
    if (prev && (c.length < MIN_CHUNK_CHARS || prev.length + c.length < TARGET_CHARS / 2)) {
      merged[merged.length - 1] = `${prev}\n${c}`;
    } else {
      merged.push(c);
    }
  }
  return merged.map((c) => (c.length > MAX_CHUNK_CHARS ? c.slice(0, MAX_CHUNK_CHARS) : c));
}

/** Simple, fast string hash for source fingerprints. */
export function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Chunk a cleaned source doc into retrieval units with full metadata.
 * Docs with no headings become 1-3 body chunks (title acts as the section).
 */
export function chunkDoc(doc: RawSourceDoc): Chunk[] {
  const cleaned = cleanText(doc.content);
  if (cleaned.length < MIN_CHUNK_CHARS) return [];

  const sections = splitSections(cleaned);
  const sourceHash = hashString(doc.content);
  const chunks: Chunk[] = [];
  let part = 0;

  const push = (section: string, body: string, minChars = MIN_CHUNK_CHARS) => {
    if (body.length < minChars) return;
    chunks.push({
      id: `${doc.id}#${part}`,
      title: doc.title,
      path: doc.path,
      content: body,
      kind: doc.kind,
      section,
      part,
      sourceHash,
    });
    part += 1;
  };

  if (sections.length === 0) {
    for (const body of packBody(cleaned)) push("", body);
  } else {
    for (const s of sections) {
      const bodies = packBody(s.body);
      if (bodies.length === 0) {
        // Short-but-real sections (a one-sentence definition, for example)
        // are exactly what keyword queries target — keep them whole.
        push(s.heading, s.body.trim(), 20);
        continue;
      }
      for (const body of bodies) push(s.heading, body);
    }
  }

  return chunks;
}
