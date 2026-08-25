'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useStudent } from '@/providers/student-provider';
import { useKB } from '@/providers/kb-provider';
import { getJourneyView, buildCardsById } from '@/lib/journey/journey-engine';
import { detectAntiPatternTriggers, matchingMentorNotes } from '@/lib/recommendations/scoring';
import AppShell from '@/components/layout/app-shell';
import { CountUp } from '@/components/motion/count-up';
import { TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function WeeklyReviewPage() {
  const reduce = useReducedMotion();
  const { student, isLoading } = useStudent();
  const kb = useKB();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !student) router.push('/onboarding');
  }, [student, isLoading, router]);

  const pageModel = useMemo(() => {
    if (!student) return null;
    const allCards = [...kb.tasks, ...kb.antiPatterns, ...kb.decisions, ...kb.mentorNotes, ...kb.opportunities];
    const cardsById = buildCardsById(allCards);
    const journey = kb.journeys.find((j) => j.id === student.journeyId);
    if (!journey) return null;
    const journeyView = getJourneyView(journey, student, cardsById);
    const phase = journeyView.phases[journeyView.currentPhaseIndex];
    const total = phase.tasks.length;
    const done = phase.tasks.filter((t) => student.completedTaskIds.includes(t.id)).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const warnings = detectAntiPatternTriggers(student, kb.antiPatterns);
    const mentorNote = matchingMentorNotes(student, kb.mentorNotes)[0] ?? kb.mentorNotes[0] ?? null;
    const suggestions = phase.tasks.filter((t) => !student.completedTaskIds.includes(t.id)).slice(0, 3);
    return { journeyView, phase, pct, done, total, warnings, mentorNote, suggestions };
  }, [student, kb]);

  if (isLoading || !student) {
    return (
      <AppShell>
        <div className="py-24 text-center text-muted">Loading…</div>
      </AppShell>
    );
  }

  if (!pageModel) {
    return (
      <AppShell>
        <div className="py-24 text-center text-muted">
          This path is being curated. The mentor brain for this segment is coming soon.
        </div>
      </AppShell>
    );
  }

  const { pct, done, total, warnings, mentorNote, suggestions, phase } = pageModel;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <motion.header
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="mb-8"
        >
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            Weekly review
          </h1>
          <p className="mt-2 text-sm text-muted">
            A deterministic look at your completed vs planned work.
          </p>
        </motion.header>

        <div className="space-y-6">
          <motion.section
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: easeOut }}
            className="rounded-2xl border border-line bg-panel/60 p-6 shadow-card"
          >
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-accent" />
              <h2 className="font-semibold text-ink">Completion</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-4xl font-bold text-accent">
                <CountUp value={pct} suffix="%" />
              </span>
              <div className="flex-1">
                <div className="h-3 w-full rounded-full bg-panel-2">
                  <motion.div
                    className="h-3 rounded-full bg-gradient-to-r from-accent to-sky"
                    initial={reduce ? false : { width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: easeOut }}
                  />
                </div>
                <p className="mt-2 text-sm text-muted">
                  {done} of {total} tasks done in “{phase.title}”.
                </p>
              </div>
            </div>
          </motion.section>

          {warnings.length > 0 && (
            <motion.section
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
              className="rounded-2xl border border-coral/25 bg-coral/10 p-6"
            >
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-coral" />
                <h2 className="font-semibold text-ink">Patterns to watch</h2>
              </div>
              <ul className="space-y-2">
                {warnings.map((w) => (
                  <li key={w.id} className="text-sm text-coral/90">
                    <Link href={`/cards/${w.id}`} className="hover:underline">
                      • {w.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.section>
          )}

          <motion.section
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: easeOut }}
            className="rounded-2xl border border-line bg-panel/60 p-6 shadow-card"
          >
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb size={16} className="text-sun" />
              <h2 className="font-semibold text-ink">Mentor feedback</h2>
            </div>
            <p className="text-sm text-muted italic">
              {mentorNote?.description ??
                (pct < 50
                  ? 'Focus on one task at a time this week — consistency beats intensity.'
                  : 'Keep this momentum. Consistency across weeks is what compounds.')}
            </p>
          </motion.section>

          <motion.section
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: easeOut }}
            className="rounded-2xl border border-line bg-panel/60 p-6 shadow-card"
          >
            <h2 className="mb-4 font-semibold text-ink">Suggested next week</h2>
            {suggestions.length > 0 ? (
              <ul className="space-y-2">
                {suggestions.map((t) => (
                  <li key={t.id}>
                    <Link href={`/tasks/${t.id}`} className="text-sm text-accent hover:underline">
                      • {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">
                This phase is complete. Ready to advance in the journey.
              </p>
            )}
          </motion.section>
        </div>
      </div>
    </AppShell>
  );
}