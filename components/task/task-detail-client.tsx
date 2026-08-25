'use client';

import { useStudent } from '@/providers/student-provider';
import { useKB } from '@/providers/kb-provider';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { LocalEventLogger } from '@/lib/events/local-event-logger';
import { Button, Badge } from '@/components/ui';
import { CheckCircle2, Undo2, Clock, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TaskDetailClient({ id }: { id: string }) {
  const reduce = useReducedMotion();
  const { student, updateStudent } = useStudent();
  const kb = useKB();
  const router = useRouter();

  const task = kb.tasks.find((t) => t.id === id);
  if (!student || !task) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base text-muted">
        <p>Task not found.</p>
      </div>
    );
  }

  const isDone = student.completedTaskIds.includes(task.id);

  const toggleComplete = () => {
    const next = isDone
      ? student.completedTaskIds.filter((x) => x !== task.id)
      : [...student.completedTaskIds, task.id];
    updateStudent({ completedTaskIds: next, lastActiveAt: new Date().toISOString() });
    new LocalEventLogger().logEvent(isDone ? 'task_skipped' : 'task_completed', { taskId: task.id });
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft size={15} /> Back to dashboard
        </button>
        <div className="mb-2 flex items-center gap-2 text-xs">
          <Badge variant="info" size="sm">
            Task
          </Badge>
          {task.estimatedHours && (
            <span className="inline-flex items-center gap-1 font-mono text-xs text-faint">
              <Clock size={12} /> {task.estimatedHours}h estimated
            </span>
          )}
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          {task.title}
        </h1>
        {task.description && <p className="mt-3 text-lg text-muted">{task.description}</p>}
      </div>

      <article className="whitespace-pre-wrap leading-relaxed text-ink/90">{task.content}</article>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-10 flex items-center gap-4"
      >
        <Button variant={isDone ? 'secondary' : 'accent'} onClick={toggleComplete}>
          {isDone ? <Undo2 className="mr-1" /> : <CheckCircle2 className="mr-1" />}
          {isDone ? 'Mark as not relevant / undo' : 'Mark complete'}
        </Button>
        {task.estimatedHours && (
          <span className="text-sm text-faint">≈ {task.estimatedHours} hours total</span>
        )}
      </motion.div>
    </main>
  );
}