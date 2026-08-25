"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/lib/typing/types";
import { generateText, DIFFICULTIES } from "@/lib/typing/generator";

interface LiveStats {
  wpm: number;
  raw: number;
  accuracy: number;
  elapsedSec: number;
  progress: number;
}

interface EngineCallbacks {
  onComplete: (result: {
    wpm: number;
    raw: number;
    accuracy: number;
    consistency: number;
    durationMs: number;
    chars: number;
    errors: number;
  }) => void;
  onLive: (stats: LiveStats) => void;
}

function clampConsistency(samples: number[]): number {
  if (samples.length < 2) return 100;
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  if (mean === 0) return 100;
  const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;
  const cv = Math.sqrt(variance) / mean;
  return Math.max(0, Math.min(100, Math.round(100 * (1 - cv))));
}

export function TypingEngine({
  difficulty,
  onComplete,
  onLive,
  disabled,
}: EngineCallbacks & { difficulty: Difficulty; disabled: boolean }) {
  const reduce = useReducedMotion();
  const [target, setTarget] = useState<string>(() => generateText(difficulty));
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const wpmSamples = useRef<number[]>([]);
  const lastSample = useRef<number>(0);
  const typedRef = useRef(typed);
  const targetRef = useRef(target);
  const startedRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  typedRef.current = typed;
  targetRef.current = target;
  startedRef.current = startedAt;
  doneRef.current = done;

  const reportLive = useCallback(
    (t: string, started: number) => {
      const elapsedMs = Date.now() - started;
      const minutes = elapsedMs / 60000;
      const typedChars = t.length;
      const correct = t.split("").filter((c, i) => c === targetRef.current[i]).length;
      const wpm = minutes > 0 ? correct / 5 / minutes : 0;
      const raw = minutes > 0 ? typedChars / 5 / minutes : 0;
      const accuracy = typedChars > 0 ? (correct / typedChars) * 100 : 100;
      onLive({
        wpm,
        raw,
        accuracy,
        elapsedSec: elapsedMs / 1000,
        progress: Math.min(100, (typedChars / targetRef.current.length) * 100),
      });
    },
    [onLive]
  );

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    const t = typedRef.current;
    const started = startedRef.current ?? Date.now();
    const durationMs = Date.now() - started;
    const minutes = durationMs / 60000;
    const correct = t.split("").filter((c, i) => c === targetRef.current[i]).length;
    const errors = t.split("").filter((c, i) => c !== targetRef.current[i]).length;
    const wpm = minutes > 0 ? correct / 5 / minutes : 0;
    const raw = minutes > 0 ? t.length / 5 / minutes : 0;
    const accuracy = t.length > 0 ? (correct / t.length) * 100 : 100;

    // per-second WPM for consistency
    const samples: number[] = [];
    const step = 1000;
    for (let ms = step; ms < durationMs; ms += step) {
      const m = ms / 60000;
      const charsSoFar = Math.min(t.length, Math.round((ms / durationMs) * t.length));
      samples.push(m > 0 ? charsSoFar / 5 / m : 0);
    }
    wpmSamples.current.forEach((s) => samples.push(s));
    const consistency = clampConsistency(samples);

    onComplete({
      wpm: Math.round(wpm * 10) / 10,
      raw: Math.round(raw * 10) / 10,
      accuracy: Math.round(accuracy * 10) / 10,
      consistency,
      durationMs,
      chars: t.length,
      errors,
    });
  }, [onComplete]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (doneRef.current || disabled) return;
      const value = e.target.value;
      // prevent typing past the target
      const next = value.length > targetRef.current.length ? typedRef.current : value;

      if (!startedRef.current && next.length > 0) {
        setStartedAt(Date.now());
        startedRef.current = Date.now();
      }

      // mistake feedback
      if (next.length > 0 && next[next.length - 1] !== targetRef.current[next.length - 1]) {
        setShake(true);
        window.setTimeout(() => setShake(false), 320);
      }

      setTyped(next);

      if (startedRef.current) {
        const now = Date.now();
        if (now - lastSample.current > 1500) {
          const m = (now - startedRef.current) / 60000;
          if (m > 0) wpmSamples.current.push(next.length / 5 / m);
          lastSample.current = now;
        }
        reportLive(next, startedRef.current);
      }

      if (next === targetRef.current && next.length > 0) {
        finish();
      }
    },
    [disabled, finish, reportLive]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") e.preventDefault();
      if (e.key === "Escape") {
        setTyped("");
        setStartedAt(null);
        startedRef.current = null;
        wpmSamples.current = [];
        onLive({ wpm: 0, raw: 0, accuracy: 100, elapsedSec: 0, progress: 0 });
      }
    },
    [onLive]
  );

  // reset target when difficulty changes from the page
  useEffect(() => {
    if (typed.length === 0 && startedAt === null) {
      setTarget(generateText(difficulty));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const currentChar = typed.length < target.length ? target[typed.length] : null;

  return (
    <div className="relative">
      <div
        className={cn(
          "rounded-2xl border border-line bg-panel/60 p-8 sm:p-12 cursor-text transition-colors",
          shake && "animate-shake border-coral/40"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <p
          className={cn(
            "font-mono text-2xl sm:text-3xl leading-[1.9] tracking-wide break-words select-none min-h-[3.5em]",
            disabled ? "opacity-40" : ""
          )}
          aria-label="Text to type"
        >
          {target.split("").map((char, i) => {
            let cls = "text-faint";
            if (i < typed.length) {
              cls = typed[i] === char ? "text-ink" : "text-coral bg-coral/10";
            }
            if (i === typed.length && !done) {
              cls = "text-accent";
            }
            return (
              <span key={i} className={cls} data-i={i}>
                {char === " " ? "\u00A0" : char}
                {i === typed.length && !done && (
                  <span
                    className={cn(
                      "inline-block w-[2px] -mb-[0.2em] ml-[1px] h-[1em] bg-accent animate-caret-blink",
                      reduce && "animate-none"
                    )}
                  />
                )}
              </span>
            );
          })}
        </p>
      </div>

      <input
        ref={inputRef}
        value={typed}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoFocus
        disabled={done || disabled}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        className="absolute -left-[9999px] top-0 opacity-0"
        aria-label="Typing input"
      />
      {done && (
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center text-sm font-medium text-accent"
        >
          Done — {target.length} chars in {DIFFICULTIES[difficulty].label.toLowerCase()} mode
        </motion.p>
      )}
    </div>
  );
}