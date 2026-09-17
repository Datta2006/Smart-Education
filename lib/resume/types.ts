/**
 * Jake's Resume format — a single-column, ATS-safe, one-page resume
 * (github.com/jakegut/resume). Data model mirrors its sections:
 * header, education, experience, projects, skills.
 */

export interface ResumeHeader {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface ResumeEducationItem {
  id: string;
  school: string;
  degree: string;
  grade: string;
  start: string;
  end: string;
}

export interface ResumeExperienceItem {
  id: string;
  company: string;
  role: string;
  start: string;
  end: string;
  location: string;
  bullets: string[];
}

export interface ResumeProjectItem {
  id: string;
  name: string;
  tech: string;
  link: string;
  bullets: string[];
}

export interface ResumeSkills {
  languages: string;
  frameworks: string;
  tools: string;
  coursework: string;
}

export interface ResumeData {
  header: ResumeHeader;
  education: ResumeEducationItem[];
  experience: ResumeExperienceItem[];
  projects: ResumeProjectItem[];
  skills: ResumeSkills;
}

export function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function emptyResume(): ResumeData {
  return {
    header: {
      name: "",
      headline: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      website: "",
    },
    education: [],
    experience: [],
    projects: [],
    skills: { languages: "", frameworks: "", tools: "", coursework: "" },
  };
}
