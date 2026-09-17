'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useKB } from '@/providers/kb-provider';
import { useStudent } from '@/providers/student-provider';
import { COURSE_CATALOG } from '@/lib/courses/catalog';
import AppShell from '@/components/layout/app-shell';
import { Input } from '@/components/ui';
import type { KBType } from '@/types/kb';
import { Binary, Network } from 'lucide-react';
import { cn } from '@/lib/utils';

const FILTERS: { label: string; value: KBType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Tasks', value: 'task' },
  { label: 'Anti-patterns', value: 'anti-pattern' },
  { label: 'Decisions', value: 'decision' },
  { label: 'Mentor notes', value: 'mentor-note' },
  { label: 'Opportunities', value: 'opportunity' },
];

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function ExplorePage() {
  const reduce = useReducedMotion();
  const kb = useKB();
  const { student } = useStudent();
  const [type, setType] = useState<KBType | 'all'>('all');
  const [query, setQuery] = useState('');

  const allCards = [
    ...kb.tasks,
    ...kb.antiPatterns,
    ...kb.decisions,
    ...kb.mentorNotes,
    ...kb.opportunities,
  ];

  const filtered = allCards.filter((c) => {
    if (type !== 'all' && c.type !== type) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      if (!`${c.title} ${c.description} ${c.tags.join(' ')}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <motion.header
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="mb-8"
        >
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            Explore
          </h1>
          <p className="mt-2 text-muted">
            Everything in the mentor knowledge base, browsable and filterable.
          </p>
        </motion.header>

        {/* Courses — the learnable library */}
        <section className="mb-10">
          <h2 className="mb-1 font-display text-lg font-semibold text-ink">Courses</h2>
          <p className="mb-4 text-sm text-muted">
            Structured modules you can work through and check off.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/courses"
              className="group rounded-2xl border border-line bg-panel/60 p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-accent/30"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10">
                  <Binary className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink">DSA Patterns</h3>
                  <p className="text-sm text-muted">
                    {COURSE_CATALOG.dsa.total} problems · {COURSE_CATALOG.dsa.modules.length} pattern modules
                  </p>
                </div>
              </div>
            </Link>
            <Link
              href="/courses"
              className="group rounded-2xl border border-line bg-panel/60 p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-sky/30"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky/10">
                  <Network className="h-5 w-5 text-sky" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink">System Design</h3>
                  <p className="text-sm text-muted">
                    {COURSE_CATALOG.systemDesign.total} topics · concepts + classic designs
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        <h2 className="mb-4 font-display text-lg font-semibold text-ink">Mentor knowledge base</h2>
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, skills, tags…"
            className="min-w-[220px] flex-1"
          />
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setType(f.value)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  type === f.value
                    ? 'bg-accent text-base-ink'
                    : 'border border-line bg-panel/40 text-muted hover:bg-panel-2/60 hover:text-ink'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((card, i) => {
            const href = card.type === 'task' ? `/tasks/${card.id}` : `/cards/${card.id}`;
            return (
              <motion.div
                key={card.id}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.4), ease: easeOut }}
              >
                <Link
                  href={href}
                  className="block h-full rounded-2xl border border-line bg-panel/60 p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-accent/30"
                >
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
                    {card.type.replace('-', ' ')}
                  </div>
                  <h3 className="mb-1 font-semibold text-ink">{card.title}</h3>
                  <p className="line-clamp-3 text-sm text-muted">{card.description}</p>
                  {card.priority === 'high' && (
                    <span className="mt-2 inline-block rounded-full border border-coral/25 bg-coral/10 px-2 py-0.5 text-[11px] font-medium text-coral">
                      High priority
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-24 text-center text-muted">
            <p className="text-lg font-medium text-ink">No cards found.</p>
            <p className="mt-1 text-sm">Try a different filter or search.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}