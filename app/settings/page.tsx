'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useStudent } from '@/providers/student-provider';
import { env } from '@/lib/config/env';
import AppShell from '@/components/layout/app-shell';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Trash2, Zap } from 'lucide-react';

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function SettingsPage() {
  const reduce = useReducedMotion();
  const { student, isLoading, updateStudent, resetStudent } = useStudent();
  const router = useRouter();

  const [weeklyHours, setWeeklyHours] = useState<number>(10);
  const [name, setName] = useState('');
  const [concerns, setConcerns] = useState<string>('');

  useEffect(() => {
    if (student) {
      setWeeklyHours(student.weeklyHours);
      setName(student.name);
      setConcerns(student.concerns.join(', '));
    }
  }, [student]);

  const save = async () => {
    if (!student) return;
    await updateStudent({
      name,
      weeklyHours: Number(weeklyHours) || 0,
      concerns: concerns.split(',').map((s) => s.trim()).filter(Boolean),
      lastActiveAt: new Date().toISOString(),
    });
  };

  const handleReset = async () => {
    await resetStudent();
    router.push('/');
  };

  if (isLoading || !student) {
    return (
      <AppShell>
        <div className="py-24 text-center text-muted">Loading…</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <motion.header
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="mb-8"
        >
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            Settings
          </h1>
        </motion.header>

        <div className="space-y-6">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: easeOut }}
          >
            <Card>
              <CardHeader>
                <CardTitle size="lg">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="Weekly hours"
                  type="number"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                />
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
                    Concerns (comma separated)
                  </label>
                  <textarea
                    value={concerns}
                    onChange={(e) => setConcerns(e.target.value)}
                    rows={3}
                    className="w-full resize-y rounded-xl border border-line bg-panel-2/60 px-4 py-2.5 text-sm text-ink placeholder:text-faint focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all"
                  />
                </div>
                <Button variant="accent" onClick={save}>
                  Save changes
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
          >
            <Card>
              <CardHeader>
                <CardTitle size="lg" className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" /> AI provider
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted">
                  The app runs a deterministic, KB-grounded mentor — no external API, no keys, works
                  offline. Answers are retrieved from your local knowledge base.
                </p>
                <div className="inline-flex items-center gap-2 text-sm">
                  <span className="inline-block h-2 w-2 rounded-full bg-accent" />
                  Provider: <span className="font-medium text-ink">{env.aiProvider}</span>
                  {env.isDemoMode && <span className="text-faint">(demo mode)</span>}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: easeOut }}
          >
            <Card className="border-coral/25">
              <CardHeader>
                <CardTitle size="lg" className="text-coral">
                  Danger zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted">
                  Resets your local demo student data (localStorage). Irreversible.
                </p>
                <Button variant="danger" onClick={handleReset}>
                  <Trash2 className="mr-1" /> Reset demo data
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}