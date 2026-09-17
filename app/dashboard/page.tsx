'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useStudent } from '@/providers/student-provider';
import { useTyping } from '@/providers/typing-provider';
import { useKB } from '@/providers/kb-provider';
import { generateRecommendations } from '@/lib/recommendations/recommendation-engine';
import { matchingMentorNotes } from '@/lib/recommendations/scoring';
import { getJourneyView, buildCardsById } from '@/lib/journey/journey-engine';
import AppShell from '@/components/layout/app-shell';
import { CountUp } from '@/components/motion/count-up';
import { SpringCard } from '@/components/motion/spring-card';
import { Button } from '@/components/ui';
import { Clock, Lightbulb, AlertTriangle, ArrowRight, Keyboard, Timer, MessagesSquare, GraduationCap } from 'lucide-react';
import type { JourneyView } from '@/types/journey';
import type { RecommendationResult } from '@/types/recommendation';
import type { KBCard } from '@/types/kb';

type DashboardModel = {
  journeyView: JourneyView;
  recommendations: RecommendationResult;
  mentorNote: KBCard | null;
};

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function Dashboard() {
  const { student, isLoading } = useStudent();
  const kb = useKB();
  const router = useRouter();
  const reduce = useReducedMotion();
  const { stats } = useTyping();

  useEffect(() => {
    if (!isLoading && !student) router.push('/onboarding');
  }, [student, isLoading, router]);

  const model = useMemo<DashboardModel | null>(() => {
    if (!student) return null;
    const allCards = [...kb.tasks, ...kb.antiPatterns, ...kb.decisions, ...kb.mentorNotes, ...kb.opportunities];
    const cardsById = buildCardsById(allCards);
    const journey = kb.journeys.find((j) => j.id === student.journeyId);
    if (!journey) return null;

    const journeyView = getJourneyView(journey, student, cardsById);
    const recommendations = generateRecommendations({ snapshot: kb, studentState: student });
    const notes = matchingMentorNotes(student, kb.mentorNotes);
    const mentorNote = notes[0] ?? kb.mentorNotes[0] ?? null;

    return { journeyView, recommendations, mentorNote };
  }, [student, kb]);

  if (isLoading || !student) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-24 text-muted">Loading your plan…</div>
      </AppShell>
    );
  }

  if (!model) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg font-medium text-ink">This path is being curated.</p>
          <p className="mt-2 text-sm text-muted">The mentor brain for this segment is coming soon.</p>
        </div>
      </AppShell>
    );
  }

  const phase = model.journeyView.phases[model.journeyView.currentPhaseIndex];
  const totalTasks = phase.tasks.length;
  const doneTasks = phase.tasks.filter((t) => student.completedTaskIds.includes(t.id)).length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const topTasks = model.recommendations.recommendations
    .filter((r) => r.actionType === 'task')
    .slice(0, 3);
  const warnings = model.recommendations.recommendations.filter((r) => r.actionType === 'warning');
  const opps = phase.opportunities;

  const quickActions = [
    { href: '/courses', icon: GraduationCap, label: 'Courses', sub: 'DSA · System Design', accent: 'text-accent' },
    { href: '/typing', icon: Keyboard, label: 'Typing test', sub: stats.tests > 0 ? `best ${stats.maxWpm} wpm` : '1-min drill', accent: 'text-sky' },
    { href: '/focus', icon: Timer, label: 'Focus timer', sub: 'Deep work session', accent: 'text-sun' },
    { href: '/mentor', icon: MessagesSquare, label: 'Ask mentor', sub: 'KB answers', accent: 'text-muted' },
  ];

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
            Welcome back, {student.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {student.degree} · {student.branch} · Year {student.year} · Semester {student.semester} ·
            Phase “{phase.title}”
          </p>
        </motion.header>

        {/* Quick actions */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: easeOut }}
          className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {quickActions.map((a) => (
            <SpringCard key={a.href}>
              <Link
                href={a.href}
                className="flex h-full flex-col gap-2 rounded-2xl border border-line bg-panel/60 px-4 py-4 shadow-card transition-colors hover:border-accent/30"
              >
                <a.icon className={`h-5 w-5 ${a.accent}`} />
                <span className="text-sm font-medium text-ink">{a.label}</span>
                <span className="text-[11px] text-faint">{a.sub}</span>
              </Link>
            </SpringCard>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress */}
          <motion.section
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
            className="rounded-2xl border border-line bg-panel/60 p-6 shadow-card"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-ink">Phase progress</h2>
              <span className="font-mono text-sm text-accent">
                <CountUp value={progress} suffix="%" />
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-panel-2">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent to-sky"
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.35, ease: easeOut }}
              />
            </div>
            <p className="mt-3 text-sm text-muted">
              {doneTasks} of {totalTasks} tasks completed in this phase.
            </p>
            <Link
              href="/journey"
              className="mt-4 inline-flex items-center gap-1 text-sm text-accent hover:text-accent-hi transition-colors"
            >
              View full journey <ArrowRight size={14} />
            </Link>
          </motion.section>

          {/* Today's Top 3 */}
          <motion.section
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: easeOut }}
            className="lg:col-span-2 rounded-2xl border border-line bg-panel/60 p-6 shadow-card"
          >
            <h2 className="mb-4 font-semibold text-ink">Today's Top 3</h2>
            <div className="space-y-3">
              {topTasks.length === 0 && (
                <p className="text-sm text-muted">
                  All current-phase tasks are done. Check the journey to advance phases, or browse
                  Explore for what to do next.
                </p>
              )}
              {topTasks.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={reduce ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.08, ease: easeOut }}
                >
                  <Link
                    href={`/tasks/${r.sourceKBIds[0]}`}
                    className="block rounded-xl border border-line bg-panel-2/50 p-4 transition-colors hover:border-accent/30 hover:bg-panel-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-ink">{r.title}</h3>
                        <p className="mt-1 text-sm text-muted">{r.reason}</p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs text-faint">
                        <Clock size={12} /> {r.estimatedTime}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Mentor insight */}
          <motion.section
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: easeOut }}
            className="rounded-2xl border border-line bg-panel/60 p-6 shadow-card"
          >
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb size={16} className="text-sun" />
              <h2 className="font-semibold text-ink">Mentor insight</h2>
            </div>
            <p className="text-sm text-muted italic">
              {model.mentorNote?.description ?? 'Mentor notes are coming soon.'}
            </p>
            <Link href="/mentor" className="mt-4 inline-flex items-center gap-1 text-sm text-accent hover:text-accent-hi transition-colors">
              Ask your mentor <ArrowRight size={14} />
            </Link>
          </motion.section>

          {/* Warnings */}
          {warnings.length > 0 && (
            <motion.section
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: easeOut }}
              className="lg:col-span-2 rounded-2xl border border-coral/25 bg-coral/10 p-6"
            >
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-coral" />
                <h2 className="font-semibold text-ink">Watch out</h2>
              </div>
              <div className="space-y-2">
                {warnings.map((w) => (
                  <Link
                    key={w.id}
                    href={`/cards/${w.sourceKBIds[0]}`}
                    className="block rounded-lg border border-coral/20 bg-panel/60 p-3 text-sm text-muted transition-colors hover:border-coral/40"
                  >
                    <span className="font-medium text-ink">{w.title}</span>
                    <span className="text-faint"> — {w.reason}</span>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}

          {/* Opportunities */}
          <motion.section
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: easeOut }}
            className="lg:col-span-2 rounded-2xl border border-line bg-panel/60 p-6 shadow-card"
          >
            <h2 className="mb-4 font-semibold text-ink">Opportunities this phase</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {opps.length === 0 && (
                <p className="text-sm text-muted sm:col-span-2">
                  No opportunities listed in this phase yet.
                </p>
              )}
              {opps.map((o) => (
                <Link
                  key={o.id}
                  href={`/cards/${o.id}`}
                  className="rounded-xl border border-line bg-panel-2/50 p-4 transition-colors hover:border-accent/30"
                >
                  <h3 className="font-medium text-ink">{o.title}</h3>
                  <p className="mt-1 text-sm text-muted">{o.description}</p>
                </Link>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </AppShell>
  );
}