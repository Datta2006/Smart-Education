"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import AppShell from "@/components/layout/app-shell";
import { useCourses } from "@/providers/course-provider";
import { COURSE_CATALOG } from "@/lib/courses/catalog";
import type { CourseQuestion } from "@/lib/courses/catalog";
import { Badge } from "@/components/ui";
import { ArrowLeft, CheckCircle2, Circle, ExternalLink, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const easeOut = [0.16, 1, 0.3, 1] as const;

const DIFFICULTY_VARIANT = {
  easy: "success",
  medium: "warning",
  hard: "danger",
} as const;

export default function DsaModulePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const reduce = useReducedMotion();
  const { done, toggle } = useCourses();
  const [filter, setFilter] = useState<"all" | "todo">("all");

  const mod = useMemo(
    () => COURSE_CATALOG.dsa.modules.find((m) => m.id === id),
    [id]
  );

  if (!mod) {
    return (
      <AppShell>
        <div className="py-24 text-center text-muted">Module not found.</div>
      </AppShell>
    );
  }

  const questions = useMemo(() => {
    if (!mod) return [];
    if (filter === "todo")
      return mod.questions.filter((q) => !done("dsa", q.id));
    return mod.questions;
  }, [mod, filter, done]);

  const doneCount = mod.questions.filter((q) => done("dsa", q.id)).length;
  const pct = mod.questions.length
    ? Math.round((doneCount / mod.questions.length) * 100)
    : 0;

  async function openLeetCode(q: CourseQuestion) {
    const searchQuery = q.leetcodeNumber
      ? `leetcode problem ${q.leetcodeNumber}`
      : q.title;

    const tab = window.open("about:blank", "_blank");

    if (!tab) {
      alert("Please allow popups for this website.");
      return;
    }

    try {
      const res = await fetch("/api/leetcode/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: searchQuery,
        }),
      });

      const data = await res.json();

      console.log("Backend response:", data);

      if (!res.ok || !data.url) {
        tab.close();

        alert("Could not find the LeetCode problem");
        return;
      }

      tab.location.href = data.url;
    } catch (error) {
      console.error(error);

      tab.close();

      alert("Search failed");
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <Link
          href="/courses"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft size={15} /> All courses
        </Link>

        <motion.header
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
                {mod.title}
              </h1>
              <p className="mt-2 max-w-2xl text-muted">{mod.description}</p>
            </div>
            {pct === 100 && (
              <Badge variant="success" size="lg">
                <Trophy className="h-3.5 w-3.5" /> Module complete
              </Badge>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-panel-2">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent to-sky"
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: easeOut }}
              />
            </div>
            <span className="font-mono text-sm text-accent">
              {doneCount}/{mod.questions.length}
            </span>
          </div>
        </motion.header>

        <div className="mb-4 flex gap-2">
          {(["all", "todo"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                filter === f
                  ? "bg-accent text-base-ink"
                  : "border border-line text-muted hover:text-ink"
              )}
            >
              {f === "all" ? "All" : "To do"}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {questions.map((q, i) => {
            const isDone = done("dsa", q.id);
            return (
              <motion.div
                key={q.id}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3), ease: easeOut }}
              >
                <button
                  onClick={() => toggle("dsa", q.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                    isDone
                      ? "border-accent/25 bg-accent/5"
                      : "border-line bg-panel/50 hover:border-accent/30 hover:bg-panel-2/50"
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-line-2" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        isDone ? "text-muted line-through" : "text-ink"
                      )}
                    >
                      {q.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-faint">
                      {q.tags.join(" · ")}
                    </p>
                  </div>
                  {q.leetcodeNumber && (
                    <span className="hidden font-mono text-xs text-faint sm:inline">
                      LC {q.leetcodeNumber}
                    </span>
                  )}
                  <Badge variant={DIFFICULTY_VARIANT[q.difficulty]} size="sm">
                    {q.difficulty}
                  </Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openLeetCode(q);
                    }}
                    className="shrink-0 text-faint transition-colors hover:text-sky"
                    aria-label={`Open ${q.title} on LeetCode`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </button>
              </motion.div>
            );
          })}
        </div>

        {questions.length === 0 && (
          <p className="py-12 text-center text-sm text-muted">
            Everything solved — move to the next module. 🎉
          </p>
        )}
      </div>
    </AppShell>
  );
}