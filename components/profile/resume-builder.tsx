"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ResumeData } from "@/lib/resume/types";
import { loadResume, saveResume, migrateLegacyResume } from "@/lib/resume/storage";
import { ResumeOnePager } from "@/components/profile/resume-one-pager";
import { ResumeEditor } from "@/components/profile/resume-editor";
import { Button } from "@/components/ui";
import { Printer, Pencil, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const LEGACY_KEY = "sos_resume_sections";

export function ResumeBuilder({ studentName = "" }: { studentName?: string }) {
  const [data, setData] = useState<ResumeData | null>(null);
  const [mode, setMode] = useState<"edit" | "preview">("preview");
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    let next = loadResume();

    // One-time migration from the legacy free-text builder.
    if (
      next.header.name === "" &&
      next.education.length === 0 &&
      next.experience.length === 0 &&
      next.projects.length === 0
    ) {
      try {
        const raw = window.localStorage.getItem(LEGACY_KEY);
        if (raw) {
          const migrated = migrateLegacyResume(JSON.parse(raw));
          if (migrated) {
            next = {
              ...migrated,
              header: { ...migrated.header, name: migrated.header.name || studentName },
            };
          }
        }
      } catch {
        /* ignore */
      }
    }

    if (studentName && next.header.name === "") {
      next = { ...next, header: { ...next.header, name: studentName } };
    }

    setData(next);
  }, [studentName]);

  const update = useCallback((next: ResumeData) => {
    setData(next);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveResume(next);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1400);
    }, 400);
  }, []);

  if (!data) {
    return <p className="py-8 text-center text-sm text-muted">Loading resume…</p>;
  }

  const isEmpty =
    !data.header.email &&
    data.education.length === 0 &&
    data.experience.length === 0 &&
    data.projects.length === 0;

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["edit", "preview"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                mode === m
                  ? "bg-accent text-base-ink"
                  : "border border-line text-muted hover:text-ink"
              )}
            >
              {m === "edit" ? <Pencil className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
              {m === "edit" ? "Edit" : "Preview"}
            </button>
          ))}
          {saved && <span className="self-center text-xs text-accent">Saved</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-faint">Jake&apos;s format · one page</span>
          <Button variant="accent" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1" /> Print / PDF
          </Button>
        </div>
      </div>

      {isEmpty && mode === "preview" && (
        <p className="no-print rounded-xl border border-sky/25 bg-sky/10 px-4 py-3 text-xs text-sky">
          Tip: switch to <strong>Edit</strong> to fill in your education, experience,
          projects and skills — the preview formats everything into a one-page,
          ATS-safe resume automatically.
        </p>
      )}

      {mode === "edit" ? (
        <ResumeEditor data={data} onChange={update} />
      ) : (
        <div className="print-area">
          <ResumeOnePager data={data} />
        </div>
      )}
    </div>
  );
}
