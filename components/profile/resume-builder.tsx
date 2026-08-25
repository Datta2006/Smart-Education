"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Input } from "@/components/ui";
import { Plus, Trash2, Printer, Save, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResumeSectionData {
  section: string;
  content: string;
}

const STORAGE_KEY = "sos_resume_sections";

const DEFAULTS: ResumeSectionData[] = [
  { section: "Overview", content: "" },
  { section: "Education", content: "" },
  { section: "Projects", content: "" },
  { section: "Skills", content: "" },
];

export function ResumeBuilder({ studentSkills = [] }: { studentSkills?: string[] }) {
  const [sections, setSections] = useState<ResumeSectionData[]>(DEFAULTS);
  const [active, setActive] = useState(0);
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ResumeSectionData[];
        if (Array.isArray(parsed) && parsed.length > 0) setSections(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((next: ResumeSectionData[]) => {
    setSections(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const addSection = () => {
    const next = [...sections, { section: "", content: "" }];
    persist(next);
    setActive(next.length - 1);
  };

  const update = (field: "section" | "content", value: string) => {
    const next = sections.map((s, i) => (i === active ? { ...s, [field]: value } : s));
    persist(next);
  };

  const remove = (index: number) => {
    const next = sections.filter((_, i) => i !== index);
    persist(next);
    setActive(Math.min(active, Math.max(0, next.length - 1)));
  };

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  const skills = studentSkills.length > 0 ? studentSkills : ["DSA", "Web Development"];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex gap-2">
          {(["edit", "preview"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                mode === m ? "bg-accent text-base-ink" : "border border-line text-muted hover:text-ink"
              )}
            >
              {m === "edit" ? <Eye className="h-3.5 w-3.5" /> : <Printer className="h-3.5 w-3.5" />}
              {m === "edit" ? "Edit" : "Preview"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1" /> Print / PDF
          </Button>
          <Button variant="accent" size="sm" onClick={handleSave}>
            <Save className="mr-1" /> {saved ? "Saved" : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        {/* Section nav */}
        <div className="no-print space-y-1">
          {sections.map((s, i) => (
            <div key={i} className="group flex items-center gap-1">
              <button
                onClick={() => setActive(i)}
                className={cn(
                  "flex-1 truncate rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                  active === i ? "bg-accent/15 text-accent border border-accent/25" : "text-muted hover:bg-panel-2/60 hover:text-ink"
                )}
              >
                {s.section || `Section ${i + 1}`}
              </button>
              <button
                onClick={() => remove(i)}
                className="hidden group-hover:grid h-6 w-6 place-items-center rounded-md text-faint hover:text-coral transition-colors"
                aria-label="Remove section"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addSection} className="w-full mt-2">
            <Plus className="mr-1 h-3.5 w-3.5" /> Add section
          </Button>
        </div>

        {mode === "edit" ? (
          <div className="space-y-3">
            <Input
              label="Section title"
              value={sections[active]?.section ?? ""}
              onChange={(e) => update("section", e.target.value)}
              placeholder="e.g. Education, Experience, Projects"
            />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted uppercase tracking-wider">
                Content
              </label>
              <textarea
                value={sections[active]?.content ?? ""}
                onChange={(e) => update("content", e.target.value)}
                placeholder="Write this section… separate items with new lines"
                className="min-h-[180px] w-full resize-y rounded-xl border border-line bg-panel-2/60 px-4 py-3 text-sm text-ink placeholder:text-faint focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all"
              />
            </div>
          </div>
        ) : (
          <div className="print-area print-surface rounded-2xl border border-line bg-panel p-8 shadow-card">
            <div className="print-surface">
              <h3 className="font-display text-2xl font-semibold text-ink">Resume</h3>
              {sections.map((s, i) =>
                s.section && s.content ? (
                  <div key={i} className="mt-6">
                    <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent">
                      {s.section}
                    </h4>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink/90">{s.content}</p>
                  </div>
                ) : null
              )}
              <div className="mt-6">
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((sk) => (
                    <span key={sk} className="rounded-full border border-line bg-panel-2 px-3 py-1 text-xs text-ink">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}