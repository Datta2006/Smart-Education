"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button, Badge } from "@/components/ui";
import { CountUp } from "@/components/motion/count-up";
import { ConfettiBurst } from "@/components/motion/confetti";
import { ArrowRight, RotateCcw, Zap } from "lucide-react";
import type { Difficulty } from "@/lib/typing/types";
import { DIFFICULTIES, nextDifficulty } from "@/lib/typing/generator";

interface ResultData {
  wpm: number;
  raw: number;
  accuracy: number;
  consistency: number;
  durationMs: number;
  chars: number;
  errors: number;
}

export function ResultView({
  result,
  difficulty,
  onRetry,
  onNext,
}: {
  result: ResultData;
  difficulty: Difficulty;
  onRetry: () => void;
  onNext: () => void;
}) {
  const reduce = useReducedMotion();
  const next = nextDifficulty(difficulty);
  const seconds = Math.round(result.durationMs / 1000);

  const cells = [
    { label: "WPM", value: result.wpm, suffix: "", accent: true, decimals: 0 },
    { label: "Raw", value: result.raw, suffix: "", accent: false, decimals: 0 },
    { label: "Accuracy", value: result.accuracy, suffix: "%", accent: false, decimals: 0 },
    { label: "Consistency", value: result.consistency, suffix: "%", accent: false, decimals: 0 },
    { label: "Errors", value: result.errors, suffix: "", accent: false, decimals: 0 },
    { label: "Chars", value: result.chars, suffix: "", accent: false, decimals: 0 },
  ];

  const perf =
    result.wpm >= 80 && result.accuracy >= 95
      ? "Blazing. You're flying."
      : result.wpm >= 55 && result.accuracy >= 92
        ? "Solid — real speed with control."
        : result.wpm >= 35
          ? "Good rhythm. Keep the reps coming."
          : "Steady start. Speed compounds with practice.";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl border border-accent/25 bg-panel/80 p-8 sm:p-12 shadow-card text-center overflow-hidden"
    >
      {!reduce && <ConfettiBurst />}

      <Badge variant="accent" size="lg" className="mb-6">
        {DIFFICULTIES[difficulty].label} · {DIFFICULTIES[difficulty].description}
      </Badge>

      <div className="mb-8">
        <div className="font-mono text-7xl sm:text-8xl font-bold text-accent leading-none">
          <CountUp value={result.wpm} />
        </div>
        <p className="mt-2 text-sm uppercase tracking-[0.2em] text-muted">words per minute</p>
      </div>

      <p className="mx-auto mb-10 max-w-md text-base text-muted">{perf}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
        {cells.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-line bg-panel-2/60 px-4 py-3"
          >
            <div
              className={`font-mono text-2xl font-semibold tabular-nums ${
                c.accent ? "text-accent" : "text-ink"
              }`}
            >
              <CountUp value={c.value} suffix={c.suffix} />
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-wider text-faint">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="text-xs text-faint mb-8">
        {seconds}s · {result.chars} chars · {result.errors} errors
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button variant="accent" size="lg" onClick={onRetry}>
          <RotateCcw className="mr-1" /> Test again
        </Button>
        {next && (
          <Button variant="outline" size="lg" onClick={onNext}>
            Try {DIFFICULTIES[next].label} <ArrowRight className="ml-1" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}