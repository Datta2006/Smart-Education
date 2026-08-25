'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useKB } from '@/providers/kb-provider';
import { useStudent } from '@/providers/student-provider';
import AppShell from '@/components/layout/app-shell';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function DecisionsPage() {
  const reduce = useReducedMotion();
  const kb = useKB();
  const { student, isLoading } = useStudent();
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !student) router.push('/onboarding');
  }, [student, isLoading, router]);

  const decisions = kb.decisions;

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
            Decisions
          </h1>
          <p className="mt-2 text-sm text-muted">
            Situational guides for forks in your journey. Open one to read the full reasoning.
          </p>
        </motion.header>

        <div className="space-y-3">
          {decisions.length === 0 && (
            <p className="py-12 text-center text-muted">No decision guides in the KB yet.</p>
          )}
          {decisions.map((d, i) => {
            const isOpen = open === d.id;
            return (
              <motion.div
                key={d.id}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4), ease: easeOut }}
                className={cn(
                  'overflow-hidden rounded-2xl border transition-colors',
                  isOpen ? 'border-accent/30 bg-panel/80' : 'border-line bg-panel/60 hover:border-line-2'
                )}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : d.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-semibold text-ink">{d.title}</span>
                  <ChevronDown
                    size={18}
                    className={cn('text-faint transition-transform', isOpen && 'rotate-180 text-accent')}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: easeOut }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-line px-5 pb-5 pt-4">
                        <p className="mb-3 text-sm text-muted italic">{d.description}</p>
                        <pre className="whitespace-pre-wrap font-sans leading-relaxed text-ink/90">
                          {d.content}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}