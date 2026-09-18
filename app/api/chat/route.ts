import { NextRequest, NextResponse } from "next/server";
import { getRetrievalIndex } from "@/lib/kb/corpus";
import { retrieve, confidenceOf } from "@/lib/kb/retrieval";
import { significantTerms, extractRelevant } from "@/lib/kb/vector-store";
import { generateGrounded, isLlmEnabled } from "@/lib/kb/llm";

export const runtime = "nodejs";

const GREETINGS = /^(hi|hey|hello|yo|namaste|hii+|hlo|hola)\b/i;

const SUGGESTIONS = [
  "How should I start DSA?",
  "What are the core CS subjects?",
  "How do I prepare for placements?",
  "What's the best way to learn System Design?",
  "How do I fix my resume?",
  "What is recursion?",
];

const NO_MATCH_ANSWER =
  "I couldn't find a confident match for that in the knowledge base. Try rephrasing with keywords like the topic or concept you're curious about — or pick a suggestion below.";

interface ChatMessage {
  role: string;
  content: string;
}

/**
 * Local extractive answerer (default — zero external calls).
 * Builds a compact answer from the top chunks: lead paragraph + bullets,
 * with [n] markers matching the sources array.
 */
function buildExtractiveAnswer(
  message: string,
  top: ReturnType<typeof retrieve>["top"]
): string {
  const terms = significantTerms(message);
  const lines: string[] = [];

  top.forEach((c, i) => {
    const snippet = extractRelevant(c.doc.content, terms);
    if (!snippet) return;
    lines.push(`**[${i + 1}] ${c.doc.title}${c.doc.section ? ` — ${c.doc.section}` : ""}**\n${snippet}`);
  });

  if (lines.length === 0) return "";

  const intro =
    lines.length === 1
      ? `Here's the closest match in the knowledge base:`
      : `Here's what the knowledge base says (${lines.length} sources):`;

  return [intro, ...lines].join("\n\n");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const history: ChatMessage[] = Array.isArray(body?.history)
    ? body.history.filter(
        (m: unknown): m is ChatMessage =>
          Boolean(m) &&
          typeof (m as ChatMessage).role === "string" &&
          typeof (m as ChatMessage).content === "string"
      )
    : [];

  if (!message) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  // Greetings need no retrieval.
  if (GREETINGS.test(message)) {
    return NextResponse.json({
      answer:
        "Hey! I search this platform's knowledge base — interview prep, DSA patterns, system design, OS, DBMS and mentor advice — and answer from what I find. Try one of the questions below.",
      sources: [],
      suggestions: SUGGESTIONS,
    });
  }

  try {
    const { index, bm25 } = await getRetrievalIndex();
    const started = Date.now();

    const result = retrieve(message, history, index, bm25, {
      debug: process.env.KB_DEBUG ? console.debug.bind(console) : undefined,
    });

    if (result.top.length === 0) {
      return NextResponse.json({
        answer: NO_MATCH_ANSWER,
        sources: [],
        suggestions: SUGGESTIONS,
        corpusSize: index.docs.length,
      });
    }

    // Generation: grounded LLM if configured, local extractive otherwise.
    const generated = await generateGrounded(message, history, result.top);
    const answer = generated?.answer ?? buildExtractiveAnswer(message, result.top);
    if (generated) console.log(`[chat] answered via ${generated.via}`);

    const sources = result.top.map((c, i) => ({
      title: c.doc.title,
      path: c.doc.path,
      kind: c.doc.kind,
      section: c.doc.section ?? "",
      score: Math.round(confidenceOf(c) * 1000) / 1000,
      ref: i + 1,
    }));

    console.log(
      `[chat] q="${message.slice(0, 60)}" followUp=${result.isFollowUp} ` +
        `chunks=${result.top.length}/${result.candidates.length} ` +
        `${Date.now() - started}ms${isLlmEnabled() ? " llm" : " local"}`
    );

    const suggestions = [
      ...new Set([
        ...result.top.slice(0, 3).map((c) => `Tell me more about ${c.doc.title.toLowerCase()}`),
        ...SUGGESTIONS,
      ]),
    ].slice(0, 4);

    return NextResponse.json({
      answer,
      sources,
      suggestions,
      corpusSize: index.docs.length,
    });
  } catch (err) {
    console.error("[chat] failed", err);
    return NextResponse.json(
      { error: "Knowledge base failed to load. Try again in a moment." },
      { status: 500 }
    );
  }
}
