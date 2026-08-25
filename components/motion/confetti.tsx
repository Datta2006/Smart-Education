"use client";

import { useMemo } from "react";

const COLORS = ["#B4F34A", "#7AA2FF", "#FFC24B", "#FF6B6B", "#C9FF66", "#9B9BA8"];

export function ConfettiBurst({ count = 40 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.6 + Math.random() * 1.4,
        size: 5 + Math.random() * 6,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.6,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-10px] block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * (p.round ? 1 : 0.55),
            backgroundColor: p.color,
            borderRadius: p.round ? "9999px" : "2px",
            animation: `confetti-fall ${p.duration}s ${p.delay}s cubic-bezier(0.2, 0.6, 0.3, 1) forwards`,
          }}
        />
      ))}
    </div>
  );
}