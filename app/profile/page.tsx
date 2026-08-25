"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useStudent } from "@/providers/student-provider";
import { useTyping } from "@/providers/typing-provider";
import AppShell from "@/components/layout/app-shell";
import { CountUp } from "@/components/motion/count-up";
import { TypingChart } from "@/components/profile/typing-chart";
import { ResumeBuilder } from "@/components/profile/resume-builder";
import { Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import { dailyWpmSeries, difficultyBreakdown } from "@/lib/typing/storage";
import { Keyboard, Flame, Gauge, Target, Timer, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { student, isLoading } = useStudent();
  const { session, stats } = useTyping();

  if (isLoading || !student) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-24 text-muted">Loading profile…</div>
      </AppShell>
    );
  }

  const series = dailyWpmSeries(session);
  const breakdown = difficultyBreakdown(session);
  const maxBreakdown = Math.max(...breakdown.map((b) => b.count), 1);
  const hasData = session.tests.length > 0;

  const skillList = [
    ...student.skills,
    ...(hasData ? ["Touch typing"] : []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const statCards = [
    { icon: Keyboard, label: "Tests", value: stats.tests, suffix: "", color: "text-accent" },
    { icon: Gauge, label: "Avg WPM", value: stats.avgWpm, suffix: "", color: "text-ink" },
    { icon: Target, label: "Best WPM", value: stats.maxWpm, suffix: "", color: "text-accent" },
    { icon: Timer, label: "Accuracy", value: Math.round(stats.avgAccuracy * 10) / 10, suffix: "%", color: "text-ink" },
    { icon: Flame, label: "Streak", value: stats.streakDays, suffix: "d", color: "text-sun" },
    { icon: TrendingUp, label: "Practice", value: Math.round(stats.practiceMinutes), suffix: "min", color: "text-sky" },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex flex-wrap items-start justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-accent to-sky text-2xl font-bold text-base-ink shadow-glow">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
                {student.name}
              </h1>
              <p className="text-muted">
                Year {student.year} · {student.degree} · {student.branch.toUpperCase()} · Semester {student.semester}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {student.goals.map((g) => (
                  <Badge key={g} variant="info" size="sm">
                    {g}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/settings")}>
              Edit profile
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              Print resume
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {statCards.map((s) => (
            <div key={s.label} className="rounded-2xl border border-line bg-panel/60 px-4 py-3.5 shadow-card">
              <s.icon className={cn("mb-2 h-4 w-4", s.color)} />
              <div className={cn("font-mono text-2xl font-semibold tabular-nums", s.color)}>
                <CountUp value={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-0.5 text-[11px] uppercase tracking-wider text-faint">{s.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Typing analytics */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2 space-y-6"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle size="lg">Typing progress</CardTitle>
                    <CardDescription>Words per minute, last 14 days</CardDescription>
                  </div>
                  <Link
                    href="/typing"
                    className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
                  >
                    Practice →
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {hasData ? (
                  <TypingChart data={series} />
                ) : (
                  <div className="py-14 text-center">
                    <Keyboard className="mx-auto mb-3 h-10 w-10 text-faint" />
                    <p className="text-sm text-muted">No typing data yet.</p>
                    <Button variant="accent" size="sm" className="mt-4" onClick={() => router.push("/typing")}>
                      Take your first test
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Difficulty breakdown */}
            <Card>
              <CardHeader>
                <CardTitle size="lg">By difficulty</CardTitle>
                <CardDescription>Tests completed per level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {breakdown.length === 0 ? (
                  <p className="py-6 text-center text-sm text-faint">Complete tests to see the split.</p>
                ) : (
                  breakdown.map((b) => (
                    <div key={b.difficulty}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="capitalize text-muted">{b.difficulty}</span>
                        <span className="font-mono text-faint">
                          {b.count} test{b.count === 1 ? "" : "s"} · avg {b.avgWpm} wpm
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-panel-2">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-accent to-sky transition-[width] duration-700 ease-out-strong"
                          style={{ width: `${(b.count / maxBreakdown) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle size="lg">Skills</CardTitle>
                <CardDescription>From your profile, plus skills earned by using the app</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {skillList.map((sk) => (
                  <Badge key={sk} variant="default" size="lg" className="border-accent/25 text-ink">
                    {sk}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Resume */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="lg:sticky lg:top-24 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle size="lg">Resume builder</CardTitle>
                  <CardDescription>Edit sections, preview, print or save as PDF</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResumeBuilder studentSkills={student.skills} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle size="lg">Completed tasks</CardTitle>
                  <CardDescription>Marked off your journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {student.completedTaskIds.length === 0 ? (
                    <p className="py-4 text-center text-sm text-faint">No tasks completed yet.</p>
                  ) : (
                    student.completedTaskIds.slice(0, 6).map((id) => (
                      <Link
                        key={id}
                        href={`/tasks/${id}`}
                        className="flex items-center gap-2.5 rounded-xl border border-line bg-panel-2/50 px-3 py-2.5 text-sm text-muted hover:border-accent/30 hover:text-ink transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                        <span className="truncate">{id.replace(/-/g, " ")}</span>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}