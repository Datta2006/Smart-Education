import type { ResumeData } from "./types";
import { emptyResume } from "./types";

const KEY = "sos_resume_jake_v1";

export function loadResume(): ResumeData {
  if (typeof window === "undefined") return emptyResume();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyResume();
    const parsed = JSON.parse(raw) as Partial<ResumeData>;
    return mergeWithDefaults(parsed);
  } catch {
    return emptyResume();
  }
}

export function saveResume(data: ResumeData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage full or blocked */
  }
}

export function migrateLegacyResume(raw: unknown): ResumeData | null {
  // Legacy format: Array<{ section, content }>
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const data = emptyResume();
  for (const entry of raw as Array<{ section?: string; content?: string }>) {
    const section = (entry.section ?? "").toLowerCase();
    const content = (entry.content ?? "").trim();
    if (!content) continue;
    if (section.includes("overview") || section.includes("summary")) {
      data.header.headline = content.split("\n")[0];
    } else if (section.includes("education")) {
      data.education.push({
        id: `edu_legacy_${Math.random().toString(36).slice(2, 8)}`,
        school: "",
        degree: content.split("\n")[0],
        grade: "",
        start: "",
        end: "",
      });
    } else if (section.includes("project")) {
      data.projects.push({
        id: `prj_legacy_${Math.random().toString(36).slice(2, 8)}`,
        name: "",
        tech: "",
        link: "",
        bullets: content.split("\n").filter(Boolean),
      });
    } else if (section.includes("skill")) {
      data.skills.languages = content;
    }
  }
  return data;
}

function mergeWithDefaults(parsed: Partial<ResumeData>): ResumeData {
  const base = emptyResume();
  return {
    header: { ...base.header, ...(parsed.header ?? {}) },
    education: parsed.education ?? base.education,
    experience: parsed.experience ?? base.experience,
    projects: parsed.projects ?? base.projects,
    skills: { ...base.skills, ...(parsed.skills ?? {}) },
  };
}
