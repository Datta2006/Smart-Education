"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Play, Pause, RotateCcw, Timer as TimerIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfettiBurst } from "@/components/motion/confetti";
import { Button } from "@/components/ui";

const PRESETS = [
  { label: "Deep", minutes: 50 },
  { label: "Focus", minutes: 25 },
  { label: "Sprint", minutes: 10 },
];

const RADIUS = 130;
const CIRC = 2 * Math.PI * RADIUS;

export function FocusTimer({
  onComplete,
}: {
  onComplete: (minutes: number) => void;
}) {
  const reduce = useReducedMotion();
  const [durationSec, setDurationSec] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTicker = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => () => stopTicker(), [stopTicker]);

  const start = () => {
    if (remaining <= 0) {
      setRemaining(durationSec);
    }
    setRunning(true);
    stopTicker();
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          stopTicker();
          setRunning(false);
          setCelebrate(true);
          onComplete(Math.round(durationSec / 60));
          window.setTimeout(() => setCelebrate(false), 3500);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  };

  const pause = () => {
    setRunning(false);
    stopTicker();
  };

  const reset = () => {
    setRunning(false);
    stopTicker();
    setRemaining(durationSec);
  };

  const selectPreset = (min: number) => {
    setRunning(false);
    stopTicker();
    setDurationSec(min * 60);
    setRemaining(min * 60);
  };

  const progress = durationSec > 0 ? 1 - remaining / durationSec : 0;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-8">
      {celebrate && <ConfettiBurst count={60} />}

      <div className="flex gap-2">
        {PRESETS.map((p) => {
          const active = durationSec === p.minutes * 60;
          return (
            <button
              key={p.label}
              onClick={() => selectPreset(p.minutes)}
              className={cn(
                "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-sun/40 bg-sun/15 text-sun"
                  : "border-line text-muted hover:text-ink hover:bg-panel-2/60"
              )}
            >
              {p.label}
              <span className="ml-1.5 font-mono text-xs text-faint">{p.minutes}m</span>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <svg width={320} height={320} viewBox="0 0 320 320" className="-rotate-90">
          <circle cx={160} cy={160} r={RADIUS} fill="none" stroke="rgb(53 53 63 / 0.5)" strokeWidth={10} />
          <motion.circle
            cx={160}
            cy={160}
            r={RADIUS}
            fill="none"
            stroke="url(#focusGrad)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            animate={{ strokeDashoffset: CIRC * (1 - progress) }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
          <defs>
            <linearGradient id="focusGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFC24B" />
              <stop offset="100%" stopColor="#B4F34A" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <TimerIcon size={20} className="mb-1 text-sun" />
          <motion.div
            key={`${mm}:${ss}`}
            initial={reduce ? false : { scale: 1.02, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="font-mono text-6xl font-semibold tabular-nums text-ink"
          >
            {mm}:{ss}
          </motion.div>
          <span className="mt-2 text-xs uppercase tracking-widest text-faint">
            {running ? "focusing…" : remaining === durationSec ? "ready" : "paused"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <AnimatePresence mode="wait" initial={false}>
          {running ? (
            <motion.div key="pause" initial={reduce ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Button variant="secondary" size="lg" onClick={pause}>
                <Pause className="mr-2" /> Pause
              </Button>
            </motion.div>
          ) : (
            <motion.div key="start" initial={reduce ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Button variant="accent" size="lg" onClick={start} disabled={remaining <= 0}>
                <Play className="mr-2" /> {remaining === durationSec ? "Start" : "Resume"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <Button variant="ghost" size="lg" onClick={reset} aria-label="Reset">
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}