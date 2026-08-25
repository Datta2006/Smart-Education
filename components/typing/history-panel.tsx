"use client";

import { useTyping } from "@/providers/typing-provider";
import { Badge } from "@/components/ui";
import { CountUp } from "@/components/motion/count-up";
import { Flame, Timer, Gauge, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/lib/typing/types";
import { DIFFICULTIES } from "@/lib/typing/generator";

const BADGE_VARIANT: Record<Difficulty, "default" | "info" | "success" | "warning" | "danger"> = {
  easy: "success",
  medium: "info",
  hard: "warning",
  extreme: "danger",
};

export function HistoryPanel() {
  const { session, stats, clearHistory } = useTyping();

  if (session.tests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line-2 p-10 text-center">
        <Target className="mx-auto mb-3 h-8 w-8 text-faint" />
        <p className="text-sm text-muted">No tests yet. Run your first one above.</p>
        <p className="mt-1 text-xs text-faint">
          Every result is saved to this browser and feeds your profile graph.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Timer, label: "Tests", value: stats.tests, suffix: "" },
          { icon: Gauge, label: "Avg WPM", value: stats.avgWpm, suffix: "" },
          { icon: Target, label: "Best WPM", value: stats.maxWpm, suffix: "" },
          { icon: Flame, label: "Day streak", value: stats.streakDays, suffix: "" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-line bg-panel/60 px-4 py-3 flex items-center gap-3"
          >
            <s.icon className="h-4 w-4 text-faint shrink-0" />
            <div>
              <div className="font-mono text-xl font-semibold text-ink">
                <CountUp value={s.value} suffix={s.suffix} />
              </div>
              <div className="text-[11px] uppercase tracking-wider text-faint">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {session.tests.slice(0, 12).map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between rounded-xl border border-line bg-panel/40 px-4 py-2.5"
          >
            <div className="flex items-center gap-3">
              <Badge variant={BADGE_VARIANT[t.difficulty]} size="sm">
                {DIFFICULTIES[t.difficulty].label}
              </Badge>
              <span className="font-mono text-sm text-ink">{t.wpm} WPM</span>
              <span className="hidden sm:inline text-xs text-faint">{t.raw} raw</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-faint">
              <span>{Math.round(t.accuracy)}%</span>
              <span className={cn(t.consistency >= 85 ? "text-accent" : "text-sun")}>
                {t.consistency}% cons
              </span>
              <span className="hidden sm:inline font-mono">
                {new Date(t.date).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {session.tests.length > 12 && (
        <p className="text-center text-xs text-faint">+{session.tests.length - 12} more</p>
      )}

      <div className="text-center">
        <button
          onClick={() => {
            if (confirm("Clear all typing history for this browser?")) clearHistory();
          }}
          className="text-xs text-faint underline-offset-2 hover:text-coral transition-colors"
        >
          Clear history
        </button>
      </div>
    </div>
  );
}