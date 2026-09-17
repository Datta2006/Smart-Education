"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTyping } from "@/providers/typing-provider";
import { TypingEngine } from "@/components/typing/typing-engine";
import { ResultView } from "@/components/typing/result-view";
import { HistoryPanel } from "@/components/typing/history-panel";
import { Button, Badge } from "@/components/ui";
import { CountUp } from "@/components/motion/count-up";
import {
  Keyboard,
  ChevronDown,
  Play,
  Gauge,
  Target,
  Timer,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/lib/typing/types";
import { DIFFICULTIES, DIFFICULTY_ORDER, generateText } from "@/lib/typing/generator";

type Phase = "idle" | "running" | "done";

interface LiveStats {
  wpm: number;
  raw: number;
  accuracy: number;
  elapsedSec: number;
  progress: number;
}

const ZERO_STATS: LiveStats = { wpm: 0, raw: 0, accuracy: 100, elapsedSec: 0, progress: 0 };

export default function TypingPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { addTest, session } = useTyping();

  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [phase, setPhase] = useState<Phase>("idle");
  const [live, setLive] = useState<LiveStats>(ZERO_STATS);
  const [lastResult, setLastResult] = useState<{
    data: {
      wpm: number;
      raw: number;
      accuracy: number;
      consistency: number;
      durationMs: number;
      chars: number;
      errors: number;
    };
    difficulty: Difficulty;
  } | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const start = useCallback(() => {
    setLastResult(null);
    setLive(ZERO_STATS);
    setPhase("running");
  }, []);

  const handleLive = useCallback((s: LiveStats) => setLive(s), []);

  const handleComplete = useCallback(
    (data: {
      wpm: number;
      raw: number;
      accuracy: number;
      consistency: number;
      durationMs: number;
      chars: number;
      errors: number;
    }) => {
      addTest({ ...data, difficulty });
      setLastResult({ data, difficulty });
      setPhase("done");
    },
    [addTest, difficulty]
  );

  const next = () => {
    const i = DIFFICULTY_ORDER.indexOf(difficulty);
    if (i < DIFFICULTY_ORDER.length - 1) {
      setDifficulty(DIFFICULTY_ORDER[i + 1]);
      start();
    }
  };

  const isRunning = phase === "running";

  return (
    <div className="min-h-[100dvh] bg-base">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-line/60 bg-base/80 backdrop-blur-md no-print">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-base-ink shadow-glow">
              <Keyboard className="h-4 w-4" />
            </div>
            <span className="font-display font-semibold text-ink">Typing Lab</span>
          </Link>

          <div className="flex items-center gap-2">
            {isRunning && (
              <span className="hidden sm:flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5">
                <Timer className="h-3.5 w-3.5 text-faint" />
                <span className="font-mono text-sm text-ink tabular-nums">
                  {Math.round(live.elapsedSec)}s
                </span>
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-muted"
            >
              <ArrowLeft className="mr-1" /> Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-14">
        {/* difficulty selector */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {DIFFICULTY_ORDER.map((d) => (
            <button
              key={d}
              onClick={() => {
                setDifficulty(d);
                if (phase === "running" || phase === "done") setPhase("idle");
              }}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-160 ease-out-strong",
                difficulty === d
                  ? "bg-accent text-base-ink shadow-glow"
                  : "border border-line text-muted hover:border-line-2 hover:text-ink"
              )}
            >
              {DIFFICULTIES[d].label}
              <span className="ml-1.5 hidden sm:inline text-[11px] opacity-70">
                {DIFFICULTIES[d].description}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <motion.div
              key="idle"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <div className="mx-auto mb-6 w-fit">
                <div className="relative grid place-items-center">
                  <div className="absolute inset-0 animate-gradient-pan rounded-full bg-gradient-to-tr from-accent/25 via-sky/20 to-accent/25 blur-2xl" />
                  <div className="relative grid h-24 w-24 place-items-center rounded-full border border-line bg-panel shadow-card">
                    <Gauge className="h-10 w-10 text-accent" />
                  </div>
                </div>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
                Type what appears.
                <br />
                <span className="text-gradient">Get faster every rep.</span>
              </h1>
              <p className="mx-auto mt-4 max-w-md text-muted">
                {DIFFICULTIES[difficulty].label} mode — {DIFFICULTIES[difficulty].description}.
                Random characters are generated fresh for every test. No sentences to memorize.
              </p>

              <div className="mt-10">
                <Button variant="accent" size="lg" onClick={start} className="gap-3 px-10">
                  <Play className="h-5 w-5" /> Start Test
                </Button>
              </div>

              <p className="mt-6 text-xs text-faint">
                {session.tests.length > 0
                  ? `${session.tests.length} tests saved · keep typing to build your graph`
                  : "Your first test saves to your profile automatically"}
              </p>
            </motion.div>
          )}

          {phase === "running" && (
            <motion.div
              key="running"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-6 grid grid-cols-3 gap-3 sm:max-w-md sm:mx-auto">
                {[
                  { icon: Gauge, label: "WPM", value: Math.round(live.wpm), accent: true },
                  { icon: Target, label: "Accuracy", value: Math.round(live.accuracy), suffix: "%" },
                  { icon: Timer, label: "Time", value: Math.round(live.elapsedSec), suffix: "s" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-line bg-panel/50 px-3 py-2.5 text-center"
                  >
                    <div
                      className={cn(
                        "font-mono text-xl sm:text-2xl font-semibold tabular-nums",
                        s.accent ? "text-accent" : "text-ink"
                      )}
                    >
                      {s.value}
                      {s.suffix ?? ""}
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider text-faint">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-panel-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-sky transition-[width] duration-200 ease-linear"
                  style={{ width: `${live.progress}%` }}
                />
              </div>

              <TypingEngine
                key={difficulty}
                difficulty={difficulty}
                onLive={handleLive}
                onComplete={handleComplete}
                disabled={false}
              />
            </motion.div>
          )}

          {phase === "done" && lastResult && (
            <motion.div
              key="done"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ResultView
                result={lastResult.data}
                difficulty={lastResult.difficulty}
                onRetry={start}
                onNext={next}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* history */}
        <section className="mt-14">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="mx-auto flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
          >
            History & stats
            <ChevronDown
              className={cn("h-4 w-4 transition-transform duration-300", showHistory && "rotate-180")}
            />
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={reduce ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden mt-6"
              >
                <HistoryPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {session.tests.length === 0 && (
          <p className="mt-16 text-center text-xs text-faint">
            Tip: press Esc mid-test to restart · click the text to refocus the input
          </p>
        )}
      </main>
    </div>
  );
}