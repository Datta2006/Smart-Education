/**
 * Optional grounded generation stage.
 *
 * Default (AI_PROVIDER=mock / unset): returns null — /api/chat answers
 * extractively from the retrieved chunks with zero external calls, exactly
 * as BRAINSTORM.md specifies.
 *
 * If a real provider is configured (AI_PROVIDER=openai|gemini + AI_API_KEY
 * in .env.local), the retrieved chunks + sources are sent to the LLM under
 * a strict grounding contract: answer ONLY from the provided context, cite
 * [n], and say so when the KB lacks the answer.
 */

import type { RetrievalCandidate } from "./retrieval";

export interface GeneratedAnswer {
  answer: string;
  /** Which model/provider produced it, for logging. */
  via: string;
}

const SYSTEM_PROMPT = `You are the KB Mentor, a study assistant for a CS-student platform.
You answer strictly from the numbered knowledge-base chunks provided in the user message.

Rules:
- Answer ONLY from the numbered chunks. Never use outside knowledge.
- Cite the chunk number(s) you used, like [1] or [2][3], right after the claims they support.
- If the chunks do not contain enough information to answer, reply exactly with your best short pointer to what IS covered and say the knowledge base does not cover the question. Never invent.
- Be concise and useful: short paragraphs or bullets, no preamble, no meta-commentary.`;

function formatContext(top: RetrievalCandidate[]): string {
  return top
    .map(
      (c, i) =>
        `[${i + 1}] ${c.doc.title}${c.doc.section ? ` — ${c.doc.section}` : ""} (${c.doc.kind})\n${c.doc.content}`
    )
    .join("\n\n---\n\n");
}

export function isLlmEnabled(): boolean {
  const provider = process.env.AI_PROVIDER;
  return Boolean(provider && provider !== "mock" && process.env.AI_API_KEY);
}

/** Try grounded generation; null when disabled or on any failure. */
export async function generateGrounded(
  question: string,
  history: Array<{ role: string; content: string }>,
  top: RetrievalCandidate[]
): Promise<GeneratedAnswer | null> {
  if (!isLlmEnabled() || top.length === 0) return null;

  const provider = process.env.AI_PROVIDER;
  const apiKey = process.env.AI_API_KEY!;
  const model = process.env.AI_MODEL || (provider === "gemini" ? "gemini-1.5-flash" : "gpt-4o-mini");

  const convo = history
    .slice(-4)
    .map((m) => `${m.role === "user" ? "Student" : "Mentor"}: ${m.content}`)
    .join("\n");

  const userContent = `${convo ? `Recent conversation:\n${convo}\n\n` : ""}Knowledge base chunks:\n\n${formatContext(top)}\n\nQuestion: ${question}`;

  try {
    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userContent },
          ],
        }),
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) throw new Error(`openai ${res.status}`);
      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const answer = data.choices?.[0]?.message?.content?.trim();
      return answer ? { answer, via: `openai/${model}` } : null;
    }

    if (provider === "gemini") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: "user", parts: [{ text: userContent }] }],
            generationConfig: { temperature: 0.2 },
          }),
          signal: AbortSignal.timeout(20_000),
        }
      );
      if (!res.ok) throw new Error(`gemini ${res.status}`);
      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const answer = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
      return answer ? { answer, via: `gemini/${model}` } : null;
    }

    return null;
  } catch (err) {
    console.warn("[llm] grounded generation failed, falling back to extractive:", err);
    return null;
  }
}
