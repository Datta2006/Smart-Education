import { NextRequest, NextResponse } from "next/server";
import { getVectorStore } from "@/lib/kb/corpus";
import { significantTerms, extractRelevant, type ScoredDoc } from "@/lib/kb/vector-store";

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

function buildAnswer(docs: ScoredDoc[], query: string): string {
  const terms = significantTerms(query);
  const lines: string[] = [];
  let total = 0;

  for (const doc of docs) {
    const snippet = extractRelevant(doc.content, terms);
    if (!snippet) continue;
    lines.push(`• ${snippet}`);
    total++;
  }

  if (total === 0) return "";

  const intro =
    total === 1
      ? `Here's the closest match in the knowledge base:`
      : `Here's what the knowledge base says (${total} sources):`;
  return [intro, ...lines.slice(0, 5)].join("\n\n");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const history: Array<{ role: string; content: string }> = Array.isArray(body?.history)
    ? body.history
    : [];

  if (!message) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  // Greetings need no retrieval.
  if (GREETINGS.test(message)) {
    return NextResponse.json({
      answer:
        "Hey! I search this platform's knowledge base — interview prep, DSA patterns, system design, OS, DBMS and mentor advice — and answer from what I find. No external AI, everything runs locally. Try one of the questions below.",
      sources: [],
      suggestions: SUGGESTIONS,
    });
  }

  // Fold recent context into the query for follow-up questions.
  const context = history
    .slice(-4)
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");

  const query = `${context} ${message}`.trim();

  try {
    const store = await getVectorStore();
    const docs = store.search(query, 6);

    if (docs.length === 0) {
      return NextResponse.json({
        answer:
          "I couldn't find a confident match for that in the knowledge base. Try rephrasing with keywords like the topic or concept you're curious about — or pick a suggestion below.",
        sources: [],
        suggestions: SUGGESTIONS,
      });
    }

    const answer = buildAnswer(docs, message);
    const sources = docs.slice(0, 5).map((d) => ({
      title: d.title,
      path: d.path,
      kind: d.kind,
      score: Math.round(d.score * 1000) / 1000,
    }));

    const suggestions = [
      ...new Set([
        ...docs.slice(0, 3).map((d) => `Tell me more about ${d.title.toLowerCase()}`),
        ...SUGGESTIONS,
      ]),
    ].slice(0, 4);

    return NextResponse.json({
      answer,
      sources,
      suggestions,
      corpusSize: store.size,
    });
  } catch (err) {
    console.error("[chat] failed", err);
    return NextResponse.json(
      { error: "Knowledge base failed to load. Try again in a moment." },
      { status: 500 }
    );
  }
}