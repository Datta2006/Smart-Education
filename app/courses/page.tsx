"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import AppShell from "@/components/layout/app-shell";
import { useCourses } from "@/providers/course-provider";
import { COURSE_CATALOG } from "@/lib/courses/catalog";
import { Input } from "@/components/ui";
import { Binary, Network, ListChecks, Search, ChevronRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const easeOut = [0.16, 1, 0.3, 1] as const;

type Track = "dsa" | "system-design";

export default function CoursesPage() {
  const reduce = useReducedMotion();
  const { overall, progress } = useCourses();
  const [query, setQuery] = useState("");

  const filteredDsa = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COURSE_CATALOG.dsa.modules;
    return COURSE_CATALOG.dsa.modules.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.questions.some(
          (x) => x.title.toLowerCase().includes(q) || x.tags.some((t) => t.includes(q))
        )
    );
  }, [query]);

  const filteredSd = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COURSE_CATALOG.systemDesign.modules;
    return COURSE_CATALOG.systemDesign.modules.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.topics.some((t) => t.title.toLowerCase().includes(q))
    );
  }, [query]);

  const sheets = COURSE_CATALOG.sheets;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <motion.header
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="mb-8"
        >
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            Courses
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Your full interview-prep library — {COURSE_CATALOG.dsa.total} DSA problems
            across {COURSE_CATALOG.dsa.modules.length} pattern modules,{" "}
            {COURSE_CATALOG.systemDesign.total} system design topics, and curated sheets.
            Tick items off as you solve them; progress is saved to this browser.
          </p>
        </motion.header>

        {/* Overall progress */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: easeOut }}
          className="mb-8 rounded-2xl border border-line bg-panel/60 p-5 shadow-card"
        >
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-ink">Overall progress</span>
            <span className="font-mono text-accent">
              {overall.done} / {overall.total}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-panel-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-sky transition-[width] duration-700 ease-out-strong"
              style={{ width: `${overall.pct}%` }}
            />
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search modules, problems, tags… (e.g. sliding window, DP, cache)"
            className="w-full rounded-xl border border-line bg-panel-2/60 py-3 pl-10 pr-4 text-sm text-ink placeholder:text-faint focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all"
          />
        </div>

        {/* DSA track */}
        <SectionHeader icon={Binary} title="DSA Patterns" accent="text-accent" />
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDsa.map((mod, i) => {
            const done = progress.completed.filter((k) =>
              k.startsWith(`dsa:${mod.id}:`)
            ).length;
            const pct = mod.questions.length
              ? Math.round((done / mod.questions.length) * 100)
              : 0;
            return (
              <ModuleCard
                key={mod.id}
                href={`/courses/dsa/${mod.id}`}
                index={i}
                title={mod.title}
                description={mod.description}
                meta={`${mod.questions.length} problems · ${mod.easy}E / ${mod.medium}M / ${mod.hard}H`}
                done={done}
                total={mod.questions.length}
                pct={pct}
                reduce={!!reduce}
              />
            );
          })}
        </div>

        {/* System design track */}
        <SectionHeader icon={Network} title="System Design" accent="text-sky" />
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSd.map((mod, i) => {
            const done = progress.completed.filter((k) =>
              k.startsWith(`system-design:${mod.id}:`)
            ).length;
            const pct = mod.topics.length
              ? Math.round((done / mod.topics.length) * 100)
              : 0;
            return (
              <ModuleCard
                key={mod.id}
                href={`/courses/system-design/${mod.id}`}
                index={i}
                title={mod.title}
                description={mod.description}
                meta={`${mod.topics.length} topics`}
                done={done}
                total={mod.topics.length}
                pct={pct}
                reduce={!!reduce}
              />
            );
          })}
        </div>

        {/* Sheets */}
        <SectionHeader icon={ListChecks} title="Curated Sheets" accent="text-sun" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sheets.map((s, i) => (
            <motion.div
              key={s.id}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3), ease: easeOut }}
              className="rounded-2xl border border-line bg-panel/60 p-5 shadow-card"
            >
              <h3 className="font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 line-clamp-3 text-sm text-muted">{s.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.topics.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-line bg-panel-2 px-2 py-0.5 text-[11px] text-faint"
                  >
                    {t}
                  </span>
                ))}
                {s.topics.length > 4 && (
                  <span className="text-[11px] text-faint">+{s.topics.length - 4}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDsa.length === 0 && filteredSd.length === 0 && (
          <div className="py-16 text-center text-muted">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-faint" />
            <p>No modules match “{query}”.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  accent: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Icon className={cn("h-5 w-5", accent)} />
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
    </div>
  );
}

function ModuleCard({
  href,
  index,
  title,
  description,
  meta,
  done,
  total,
  pct,
  reduce,
}: {
  href: string;
  index: number;
  title: string;
  description: string;
  meta: string;
  done: number;
  total: number;
  pct: number;
  reduce: boolean;
}) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4), ease: easeOut }}
    >
      <Link
        href={href}
        className="group block h-full rounded-2xl border border-line bg-panel/60 p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-accent/30"
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-ink">{title}</h3>
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{description}</p>
        <p className="mt-2 font-mono text-[11px] text-faint">{meta}</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-sky"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-faint">
            {done}/{total}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
