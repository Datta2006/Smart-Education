'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useStudent } from '@/providers/student-provider';
import { useKB } from '@/providers/kb-provider';
import { getJourneyView, buildCardsById } from '@/lib/journey/journey-engine';
import AppShell from '@/components/layout/app-shell';
import { CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function JourneyPage() {
  const reduce = useReducedMotion();
  const { student, isLoading } = useStudent();
  const kb = useKB();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !student) router.push('/onboarding');
  }, [student, isLoading, router]);

  const model = useMemo(() => {
    if (!student) return null;
    const cardsById = buildCardsById([
      ...kb.tasks,
      ...kb.antiPatterns,
      ...kb.decisions,
      ...kb.mentorNotes,
      ...kb.opportunities,
    ]);
    const journey = kb.journeys.find((j) => j.id === student.journeyId);
    if (!journey) return null;
    return { journeyView: getJourneyView(journey, student, cardsById), cardsById };
  }, [student, kb]);

  if (isLoading || !student) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-24 text-muted">Loading…</div>
      </AppShell>
    );
  }

  if (!model) {
    return (
      <AppShell>
        <div className="py-24 text-center text-muted">
          This path is being curated. The mentor brain for this segment is coming soon.
        </div>
      </AppShell>
    );
  }

  const { journeyView } = model;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <motion.header
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="mb-12"
        >
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            {journeyView.journey.title}
          </h1>
          <p className="mt-2 text-muted">
            Year {journeyView.journey.year} · {journeyView.journey.branch.toUpperCase()}
          </p>
        </motion.header>

        <div className="relative pl-6">
          <div className="absolute bottom-2 left-2 top-2 w-0.5 bg-line" />
          <div className="space-y-8">
            {journeyView.phases.map((phase, i) => (
              <motion.div
                key={phase.id}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 * i, ease: easeOut }}
                className="relative"
              >
                <div
                  className={cn(
                    'absolute -left-6 top-2 h-5 w-5 rounded-full border-4',
                    phase.status === 'completed'
                      ? 'border-accent/30 bg-accent'
                      : phase.status === 'current'
                        ? 'border-sky/30 bg-sky'
                        : 'border-line bg-panel-2'
                  )}
                />
                <div
                  className={cn(
                    'p-6 rounded-2xl border shadow-card',
                    phase.status === 'current'
                      ? 'border-sky/30 bg-panel/80'
                      : phase.status === 'completed'
                        ? 'border-accent/20 bg-panel/60'
                        : 'border-line bg-panel-2/30'
                  )}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <h2 className="font-display text-lg font-semibold text-ink">{phase.title}</h2>
                    <span className="text-xs text-faint">{phase.months}</span>
                  </div>
                  <p className="mb-4 text-sm text-muted">{phase.focus}</p>

                  {phase.tasks.length > 0 && (
                    <div className="space-y-2">
                      {phase.tasks.map((t) => {
                        const done = student.completedTaskIds.includes(t.id);
                        const locked = phase.status === 'locked';
                        return (
                          <div
                            key={t.id}
                            className={cn('flex items-center gap-3 text-sm', locked && 'opacity-50')}
                          >
                            {done ? (
                              <CheckCircle2 size={16} className="text-accent" />
                            ) : locked ? (
                              <Lock size={16} className="text-faint" />
                            ) : (
                              <span className="h-4 w-4 rounded-full border-2 border-line-2" />
                            )}
                            {locked ? (
                              <span className="text-muted">{t.title}</span>
                            ) : (
                              <Link
                                href={`/tasks/${t.id}`}
                                className="text-ink/90 transition-colors hover:text-accent hover:underline"
                              >
                                {t.title}
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {phase.warnings.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-coral">
                        Warnings
                      </p>
                      <div className="space-y-1">
                        {phase.warnings.map((w) => (
                          <Link
                            key={w.id}
                            href={`/cards/${w.id}`}
                            className="block text-sm text-coral/90 transition-colors hover:text-coral hover:underline"
                          >
                            • {w.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}