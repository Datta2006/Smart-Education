"use client";

import { useState } from "react";
import type {
  ResumeData,
  ResumeEducationItem,
  ResumeExperienceItem,
  ResumeProjectItem,
} from "@/lib/resume/types";
import { makeId } from "@/lib/resume/types";
import { Button, Input } from "@/components/ui";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Input
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function BulletsEditor({
  bullets,
  onChange,
  placeholder,
}: {
  bullets: string[];
  onChange: (b: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      {bullets.map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={b}
            onChange={(e) => {
              const next = [...bullets];
              next[i] = e.target.value;
              onChange(next);
            }}
            placeholder={placeholder ?? "Achievement — built X using Y, resulting in Z"}
            className="h-9 w-full rounded-xl border border-line bg-panel-2/60 px-3 text-sm text-ink placeholder:text-faint focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all"
          />
          <button
            onClick={() => onChange(bullets.filter((_, j) => j !== i))}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-faint hover:text-coral transition-colors"
            aria-label="Remove bullet"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange([...bullets, ""])}
        className="w-full"
      >
        <Plus className="mr-1 h-3.5 w-3.5" /> Add bullet
      </Button>
    </div>
  );
}

function Collapsible({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-line bg-panel-2/30">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-ink">{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-faint transition-transform duration-240",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="space-y-4 border-t border-line/60 p-4">{children}</div>}
    </div>
  );
}

export function ResumeEditor({
  data,
  onChange,
}: {
  data: ResumeData;
  onChange: (next: ResumeData) => void;
}) {
  const update = (patch: Partial<ResumeData>) => onChange({ ...data, ...patch });

  const updateHeader = (patch: Partial<ResumeData["header"]>) =>
    update({ header: { ...data.header, ...patch } });

  const updateSkills = (patch: Partial<ResumeData["skills"]>) =>
    update({ skills: { ...data.skills, ...patch } });

  return (
    <div className="space-y-4">
      <Collapsible title="Header" defaultOpen>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="Full name"
            value={data.header.name}
            onChange={(v) => updateHeader({ name: v })}
            placeholder="Jake Ryan"
          />
          <Field
            label="Headline"
            value={data.header.headline}
            onChange={(v) => updateHeader({ headline: v })}
            placeholder="CS Student @ UT Austin"
          />
          <Field
            label="Email"
            value={data.header.email}
            onChange={(v) => updateHeader({ email: v })}
            placeholder="you@example.com"
          />
          <Field
            label="Phone"
            value={data.header.phone}
            onChange={(v) => updateHeader({ phone: v })}
            placeholder="1-123-456-7890"
          />
          <Field
            label="Location"
            value={data.header.location}
            onChange={(v) => updateHeader({ location: v })}
            placeholder="City, Country"
          />
          <Field
            label="LinkedIn"
            value={data.header.linkedin}
            onChange={(v) => updateHeader({ linkedin: v })}
            placeholder="linkedin.com/in/you"
          />
          <Field
            label="GitHub"
            value={data.header.github}
            onChange={(v) => updateHeader({ github: v })}
            placeholder="github.com/you"
          />
          <Field
            label="Website"
            value={data.header.website}
            onChange={(v) => updateHeader({ website: v })}
            placeholder="yoursite.dev"
          />
        </div>
      </Collapsible>

      <Collapsible title={`Education (${data.education.length})`}>
        <div className="space-y-4">
          {data.education.map((e, i) => {
            const set = (patch: Partial<ResumeEducationItem>) => {
              const next = [...data.education];
              next[i] = { ...e, ...patch };
              update({ education: next });
            };
            return (
              <div key={e.id} className="rounded-lg border border-line/70 p-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field
                    label="School"
                    value={e.school}
                    onChange={(v) => set({ school: v })}
                  />
                  <Field
                    label="Degree"
                    value={e.degree}
                    onChange={(v) => set({ degree: v })}
                    placeholder="B.Tech in CSE — GPA 8.9/10"
                  />
                  <Field
                    label="Start"
                    value={e.start}
                    onChange={(v) => set({ start: v })}
                    placeholder="Aug 2022"
                  />
                  <Field
                    label="End"
                    value={e.end}
                    onChange={(v) => set({ end: v })}
                    placeholder="May 2026"
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      update({
                        education: data.education.filter((x) => x.id !== e.id),
                      })
                    }
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                  </Button>
                </div>
              </div>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              update({
                education: [
                  ...data.education,
                  {
                    id: makeId("edu"),
                    school: "",
                    degree: "",
                    grade: "",
                    start: "",
                    end: "",
                  },
                ],
              })
            }
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Add education
          </Button>
        </div>
      </Collapsible>

      <Collapsible title={`Experience (${data.experience.length})`}>
        <div className="space-y-4">
          {data.experience.map((x, i) => {
            const set = (patch: Partial<ResumeExperienceItem>) => {
              const next = [...data.experience];
              next[i] = { ...x, ...patch };
              update({ experience: next });
            };
            return (
              <div key={x.id} className="rounded-lg border border-line/70 p-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Role" value={x.role} onChange={(v) => set({ role: v })} placeholder="SWE Intern" />
                  <Field label="Company" value={x.company} onChange={(v) => set({ company: v })} />
                  <Field label="Start" value={x.start} onChange={(v) => set({ start: v })} placeholder="May 2025" />
                  <Field label="End" value={x.end} onChange={(v) => set({ end: v })} placeholder="Aug 2025" />
                  <Field label="Location" value={x.location} onChange={(v) => set({ location: v })} placeholder="Remote / City" />
                </div>
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
                    Bullets
                  </p>
                  <BulletsEditor
                    bullets={x.bullets}
                    onChange={(bullets) => set({ bullets })}
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      update({
                        experience: data.experience.filter((y) => y.id !== x.id),
                      })
                    }
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                  </Button>
                </div>
              </div>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              update({
                experience: [
                  ...data.experience,
                  {
                    id: makeId("exp"),
                    company: "",
                    role: "",
                    start: "",
                    end: "",
                    location: "",
                    bullets: [""],
                  },
                ],
              })
            }
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Add experience
          </Button>
        </div>
      </Collapsible>

      <Collapsible title={`Projects (${data.projects.length})`}>
        <div className="space-y-4">
          {data.projects.map((p, i) => {
            const set = (patch: Partial<ResumeProjectItem>) => {
              const next = [...data.projects];
              next[i] = { ...p, ...patch };
              update({ projects: next });
            };
            return (
              <div key={p.id} className="rounded-lg border border-line/70 p-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Name" value={p.name} onChange={(v) => set({ name: v })} />
                  <Field
                    label="Tech stack"
                    value={p.tech}
                    onChange={(v) => set({ tech: v })}
                    placeholder="React, Node, PostgreSQL"
                  />
                  <Field
                    label="Link"
                    value={p.link}
                    onChange={(v) => set({ link: v })}
                    placeholder="github.com/you/project"
                  />
                </div>
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
                    Bullets
                  </p>
                  <BulletsEditor
                    bullets={p.bullets}
                    onChange={(bullets) => set({ bullets })}
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      update({ projects: data.projects.filter((y) => y.id !== p.id) })
                    }
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                  </Button>
                </div>
              </div>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              update({
                projects: [
                  ...data.projects,
                  { id: makeId("prj"), name: "", tech: "", link: "", bullets: [""] },
                ],
              })
            }
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Add project
          </Button>
        </div>
      </Collapsible>

      <Collapsible title="Skills">
        <Field
          label="Languages"
          value={data.skills.languages}
          onChange={(v) => updateSkills({ languages: v })}
          placeholder="Python, Java, C++, SQL"
        />
        <div className="mt-3 space-y-3">
          <Field
            label="Frameworks"
            value={data.skills.frameworks}
            onChange={(v) => updateSkills({ frameworks: v })}
            placeholder="React, Next.js, Tailwind"
          />
          <Field
            label="Tools"
            value={data.skills.tools}
            onChange={(v) => updateSkills({ tools: v })}
            placeholder="Git, Docker, Postman"
          />
          <Field
            label="Coursework"
            value={data.skills.coursework}
            onChange={(v) => updateSkills({ coursework: v })}
            placeholder="Data Structures, OS, DBMS, Networks"
          />
        </div>
      </Collapsible>
    </div>
  );
}
