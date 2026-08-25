"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import AppShell from "@/components/layout/app-shell";
import { FocusTimer } from "@/components/focus/focus-timer";
import { useTyping } from "@/providers/typing-provider";
import { CountUp } from "@/components/motion/count-up";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from "@/components/ui";
import { Timer as TimerIcon, CalendarCheck2, CircleCheck } from "lucide-react";

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function FocusPage() {
  const reduce = useReducedMotion();
  const { focus, addFocusSession } = useTyping();

  const { totalMin, todayMin, sessions } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    let total = 0;
    let tday = 0;
    for (const s of focus.sessions) {
      if (s.completed) total += s.durationMin;
      if (s.date.slice(0, 10) === today && s.completed) tday += s.durationMin;
    }
    return { totalMin: total, todayMin: tday, sessions: focus.sessions };
  }, [focus]);

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
            Focus timer
          </h1>
          <p className="mt-1 text-sm text-muted">One deep-work session at a time. No tabs required.</p>
        </motion.header>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: easeOut }}
            className="rounded-2xl border border-line bg-panel/60 p-8 shadow-card"
          >
            <FocusTimer onComplete={(min) => addFocusSession(min, true)} />
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="rounded-2xl border border-line bg-panel/60 p-4 shadow-card">
                <CalendarCheck2 className="mb-2 h-4 w-4 text-sun" />
                <div className="font-mono text-2xl font-semibold text-ink">
                  <CountUp value={todayMin} suffix="m" />
                </div>
                <div className="text-[11px] uppercase tracking-wider text-faint">today</div>
              </div>
              <div className="rounded-2xl border border-line bg-panel/60 p-4 shadow-card">
                <TimerIcon className="mb-2 h-4 w-4 text-accent" />
                <div className="font-mono text-2xl font-semibold text-ink">
                  <CountUp value={totalMin} suffix="m" />
                </div>
                <div className="text-[11px] uppercase tracking-wider text-faint">total</div>
              </div>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: easeOut }}
            >
              <Card>
                <CardHeader>
                  <CardTitle size="lg">Recent sessions</CardTitle>
                  <CardDescription>Completed focus blocks</CardDescription>
                </CardHeader>
                <CardContent>
                  {sessions.length === 0 ? (
                    <p className="py-4 text-center text-sm text-faint">No sessions yet. Finish one to see it here.</p>
                  ) : (
                    <ul className="space-y-2">
                      {sessions.slice(0, 8).map((s) => (
                        <li
                          key={s.id}
                          className="flex items-center justify-between rounded-xl border border-line bg-panel-2/50 px-3 py-2.5 text-sm"
                        >
                          <span className="flex items-center gap-2 text-muted">
                            <CircleCheck
                              className={s.completed ? "h-4 w-4 text-accent" : "h-4 w-4 text-faint"}
                            />
                            {new Date(s.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="font-mono text-ink">{s.durationMin}m</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}