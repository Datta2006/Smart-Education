import React from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal markdown renderer for KB card bodies. Supports the subset the KB
 * actually uses: #/##/### headings, paragraphs, - / * / numbered lists,
 * **bold**, *italic*, `code`, ``` blocks, > quotes, --- rules, and links.
 * No dependencies, server-component-safe.
 */

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Split on inline tokens: `code`, **bold**, *italic*, [text](url)
  const re =
    /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const token = m[0];
    const key = `${keyPrefix}-i${i++}`;
    if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded-md border border-line bg-panel-2 px-1.5 py-0.5 font-mono text-[0.85em] text-accent"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-ink">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*")) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        nodes.push(
          <a
            key={key}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="text-sky underline decoration-sky/40 underline-offset-2 hover:decoration-sky"
          >
            {linkMatch[1]}
          </a>
        );
      }
    }
    last = m.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

type Block =
  | { kind: "h1" | "h2" | "h3" | "p" | "quote"; text: string }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "code"; text: string }
  | { kind: "hr" };

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: { kind: "ul" | "ol"; items: string[] } | null = null;
  let code: string[] | null = null;

  const flushPara = () => {
    if (para.length) {
      blocks.push({ kind: "p", text: para.join(" ") });
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (code !== null) {
      if (line.trim().startsWith("```")) {
        blocks.push({ kind: "code", text: code.join("\n") });
        code = null;
      } else {
        code.push(raw);
      }
      continue;
    }

    if (line.trim().startsWith("```")) {
      flushPara();
      flushList();
      code = [];
      continue;
    }

    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }

    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      flushPara();
      flushList();
      const level = h[1].length;
      blocks.push({ kind: level === 1 ? "h1" : level === 2 ? "h2" : "h3", text: h[2] });
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      flushPara();
      flushList();
      blocks.push({ kind: "hr" });
      continue;
    }

    const ul = line.match(/^[-*]\s+(.*)$/);
    if (ul) {
      flushPara();
      if (!list || list.kind !== "ul") {
        flushList();
        list = { kind: "ul", items: [] };
      }
      list.items.push(ul[1]);
      continue;
    }

    const ol = line.match(/^\d+[.)]\s+(.*)$/);
    if (ol) {
      flushPara();
      if (!list || list.kind !== "ol") {
        flushList();
        list = { kind: "ol", items: [] };
      }
      list.items.push(ol[1]);
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushPara();
      flushList();
      blocks.push({ kind: "quote", text: quote[1] });
      continue;
    }

    flushList();
    para.push(line.trim());
  }
  flushPara();
  flushList();
  if (code) blocks.push({ kind: "code", text: code.join("\n") });
  return blocks;
}

export function Markdown({ content, className }: { content: string; className?: string }) {
  const blocks = parseBlocks(content);
  return (
    <div className={cn("kb-markdown space-y-4", className)}>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "h1":
            return (
              <h2
                key={i}
                className="font-display text-2xl font-semibold tracking-tight text-ink"
              >
                {renderInline(b.text, `b${i}`)}
              </h2>
            );
          case "h2":
            return (
              <h3
                key={i}
                className="mt-8 flex items-center gap-3 font-display text-lg font-semibold text-ink"
              >
                <span className="h-4 w-1 rounded-full bg-accent" />
                {renderInline(b.text, `b${i}`)}
              </h3>
            );
          case "h3":
            return (
              <h4 key={i} className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted">
                {renderInline(b.text, `b${i}`)}
              </h4>
            );
          case "p":
            return (
              <p key={i} className="leading-relaxed text-ink/85">
                {renderInline(b.text, `b${i}`)}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-1.5 pl-1">
                {b.items.map((item, j) => (
                  <li key={j} className="flex gap-2.5 text-ink/85">
                    <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70" />
                    <span className="leading-relaxed">{renderInline(item, `b${i}-${j}`)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="space-y-1.5">
                {b.items.map((item, j) => (
                  <li key={j} className="flex gap-3 text-ink/85">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border border-accent/30 bg-accent/10 font-mono text-[11px] text-accent">
                      {j + 1}
                    </span>
                    <span className="leading-relaxed">{renderInline(item, `b${i}-${j}`)}</span>
                  </li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="rounded-r-lg border-l-2 border-sun/60 bg-sun/5 px-4 py-2.5 text-sm italic text-sun/90"
              >
                {renderInline(b.text, `b${i}`)}
              </blockquote>
            );
          case "code":
            return (
              <pre
                key={i}
                className="overflow-x-auto rounded-xl border border-line bg-panel-2/60 p-4 font-mono text-sm text-ink/90"
              >
                <code>{b.text}</code>
              </pre>
            );
          case "hr":
            return <hr key={i} className="border-line" />;
        }
      })}
    </div>
  );
}
