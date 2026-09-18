import { describe, it, expect } from "vitest";
import { cleanText, chunkDoc } from "../lib/kb/chunker";

describe("cleanText", () => {
  it("converts markdown links to anchor text and drops images", () => {
    const md = "# Title\n\nSee [the docs](https://example.com) for more.\n\n![logo](img.png)";
    const text = cleanText(md);
    expect(text).toContain("See the docs for more.");
    expect(text).not.toContain("img.png");
  });

  it("strips resource-link tails from roadmap stubs", () => {
    const md =
      "# Topic\n\nSome real explanation that is long enough to be kept by the cleaner.\n\nVisit the following resources to learn more:\n\n- [@article@Thing](https://example.com)\n- [@video@Other](https://youtu.be/x)";
    const text = cleanText(md);
    expect(text).toContain("Some real explanation");
    expect(text).not.toContain("@article@");
    expect(text).not.toContain("Visit the following resources");
  });

  it("drops code fences", () => {
    const md = "# T\n\n```cpp\nint main() { return 0; }\n```\n\nAfter the fence.";
    const text = cleanText(md);
    expect(text).not.toContain("main()");
    expect(text).toContain("After the fence.");
  });
});

describe("chunkDoc", () => {
  const sectionDoc = (sections: string[]) =>
    `# Root\n\nIntro paragraph that is long enough to count as real content for the packer.\n\n${sections
      .map((s) => `## ${s}\n\nBody of ${s}: ${"detail text ".repeat(60)}`)
      .join("\n\n")}`;

  it("splits on headings and keeps section metadata", () => {
    const chunks = chunkDoc({
      id: "note:x.md",
      title: "X",
      path: "x.md",
      content: sectionDoc(["Alpha", "Beta"]),
      kind: "note",
    });
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    const sections = chunks.map((c) => c.section);
    expect(sections).toContain("Alpha");
    expect(sections).toContain("Beta");
    expect(chunks.every((c) => c.id.startsWith("note:x.md#"))).toBe(true);
    expect(chunks.every((c) => c.kind === "note")).toBe(true);
  });

  it("respects max chunk size", () => {
    const chunks = chunkDoc({
      id: "note:big.md",
      title: "Big",
      path: "big.md",
      content: `# Big\n\n${"word ".repeat(3000)}`,
      kind: "note",
    });
    for (const c of chunks) {
      expect(c.content.length).toBeLessThanOrEqual(1400);
    }
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("returns a single chunk for small heading-less docs", () => {
    const chunks = chunkDoc({
      id: "card:t1",
      title: "Task",
      path: "content/kb/task/t1.md",
      content: "A".repeat(200) + " plain text without any markdown headings at all.",
      kind: "card",
    });
    expect(chunks.length).toBe(1);
    expect(chunks[0].section).toBe("");
    expect(chunks[0].title).toBe("Task");
  });

  it("drops tiny docs entirely", () => {
    const chunks = chunkDoc({
      id: "note:tiny.md",
      title: "Tiny",
      path: "tiny.md",
      content: "# T\n\nshort",
      kind: "note",
    });
    expect(chunks.length).toBe(0);
  });
});
