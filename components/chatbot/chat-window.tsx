"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, Send, Database, BookOpen, FileText, Map } from "lucide-react";

interface Source {
  title: string;
  path: string;
  kind: string;
  score: number;
}

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  sources?: Source[];
}

const KIND_META: Record<string, { label: string; icon: typeof BookOpen }> = {
  card: { label: "Card", icon: BookOpen },
  note: { label: "Note", icon: FileText },
  roadmap: { label: "Roadmap", icon: Map },
};

function renderAnswer(text: string) {
  // Very small markdown-ish renderer: **bold**, bullets, paragraphs.
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let list: React.ReactNode[] = [];
  const flush = (key: number) => {
    if (list.length) {
      nodes.push(
        <ul key={`ul${key}`} className="my-2 space-y-1.5">
          {list.map((li, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              <span>{li}</span>
            </li>
          ))}
        </ul>
      );
      list = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const isBullet = trimmed.startsWith("•");
    const content = (isBullet ? trimmed.slice(1) : trimmed)
      .split(/(\*\*[^*]+\*\*)/g)
      .map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-ink">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        )
      );
    if (isBullet) {
      list.push(<span>{content}</span>);
    } else {
      flush(idx);
      nodes.push(
        <p key={`p${idx}`} className="my-1.5">
          {content}
        </p>
      );
    }
  });
  flush(lines.length);
  return nodes;
}

const SUGGESTIONS = [
  "How should I start DSA?",
  "What are the core CS subjects?",
  "How do I prepare for placements?",
  "What is recursion?",
];

export function ChatWindow() {
  const reduce = useReducedMotion();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [corpusSize, setCorpusSize] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollDown = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(scrollDown, [messages, loading, scrollDown]);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || loading) return;
      setMessages((prev) => [...prev, { id: `u${Date.now()}`, role: "user", content: clean }]);
      setInput("");
      setLoading(true);

      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: clean, history }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setCorpusSize(data.corpusSize ?? null);
        setMessages((prev) => [
          ...prev,
          { id: `b${Date.now()}`, role: "bot", content: data.answer, sources: data.sources },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `b${Date.now()}`,
            role: "bot",
            content:
              "Sorry — the knowledge base is having trouble loading. Please try again in a moment.",
          },
        ]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [loading, messages]
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-line/70">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent border border-accent/25">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">KB Mentor</p>
            <p className="flex items-center gap-1.5 text-[11px] text-faint">
              <Database className="h-3 w-3" />
              {corpusSize ? `${corpusSize.toLocaleString()} documents indexed` : "vector search · no LLM"}
            </p>
          </div>
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="pt-6">
            <p className="text-sm text-muted leading-relaxed">
              Ask anything about <span className="text-ink">DSA patterns</span>,{" "}
              <span className="text-ink">system design</span>,{" "}
              <span className="text-ink">core CS subjects</span> or{" "}
              <span className="text-ink">placement strategy</span>.
            </p>
            <p className="mt-1 text-xs text-faint">
              Answers are retrieved from the platform's own knowledge base and synthesized
              locally — no external AI is called.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-line bg-panel px-3 py-1.5 text-xs text-muted hover:border-accent/40 hover:text-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-accent text-base-ink rounded-br-md"
                  : "border border-line bg-panel text-muted rounded-bl-md"
              )}
            >
              {m.role === "bot" ? renderAnswer(m.content) : m.content}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-line/70 pt-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-faint">Sources</p>
                  {m.sources.map((s, i) => {
                    const meta = KIND_META[s.kind] ?? KIND_META.note;
                    const Icon = meta.icon;
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs text-faint">
                        <Icon className="h-3 w-3 shrink-0 text-accent/70" />
                        <span className="truncate">{s.title}</span>
                        <span className="ml-auto shrink-0 font-mono text-[10px] text-accent/70">
                          {Math.round(s.score * 100)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-panel px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* input */}
      <div className="border-t border-line/70 px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the knowledge base…"
            className="h-11 flex-1 rounded-xl border border-line bg-panel-2/60 px-4 text-sm text-ink placeholder:text-faint focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-base-ink transition-all hover:bg-accent-hi active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}