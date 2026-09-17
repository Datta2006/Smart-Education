"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import AppShell from "@/components/layout/app-shell";
import { useCourses } from "@/providers/course-provider";
import { COURSE_CATALOG } from "@/lib/courses/catalog";
import { Badge } from "@/components/ui";
import { ArrowLeft, CheckCircle2, Circle, Lightbulb, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function SystemDesignModulePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const reduce = useReducedMotion();
  const { done, toggle } = useCourses();

  const mod = COURSE_CATALOG.systemDesign.modules.find((m) => m.id === id);

  if (!mod) {
    return (
      <AppShell>
        <div className="py-24 text-center text-muted">Module not found.</div>
      </AppShell>
    );
  }

  const doneCount = mod.topics.filter((t) => done("system-design", t.id)).length;
  const pct = mod.topics.length ? Math.round((doneCount / mod.topics.length) * 100) : 0;

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
                System Design — {mod.title}
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
                className="h-full rounded-full bg-gradient-to-r from-sky to-accent"
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: easeOut }}
              />
            </div>
            <span className="font-mono text-sm text-sky">
              {doneCount}/{mod.topics.length}
            </span>
          </div>
        </motion.header>

        <div className="space-y-3">
          {mod.topics.map((t, i) => {
            const isDone = done("system-design", t.id);
            return (
              <motion.div
                key={t.id}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3), ease: easeOut }}
              >
                <button
                  onClick={() => toggle("system-design", t.id)}
                  className={cn(
                    "w-full rounded-xl border px-5 py-4 text-left transition-all",
                    isDone
                      ? "border-sky/25 bg-sky/5"
                      : "border-line bg-panel/50 hover:border-sky/30 hover:bg-panel-2/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-sky" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-line-2" />
                    )}
                    <p
                      className={cn(
                        "flex-1 font-medium",
                        isDone ? "text-muted line-through" : "text-ink"
                      )}
                    >
                      {t.title}
                    </p>
                    <Badge variant={t.kind === "concept" ? "info" : "accent"} size="sm">
                      {t.kind === "concept" ? "concept" : "design"}
                    </Badge>
                  </div>

                  {t.description && (
                    <p className="mt-2 pl-8 text-sm text-muted">{t.description}</p>
                  )}

                  {t.keyIdeas.length > 0 && (
                    <div className="mt-3 ml-8 rounded-lg border border-line/70 bg-panel-2/40 p-3">
                      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-sun">
                        <Lightbulb className="h-3.5 w-3.5" /> Key ideas
                      </p>
                      <ul className="space-y-1">
                        {t.keyIdeas.map((idea, j) => (
                          <li key={j} className="text-sm text-muted">
                            • {idea}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
