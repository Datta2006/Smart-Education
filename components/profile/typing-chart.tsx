"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface Point {
  date: string;
  value: number;
  label: string;
}

export function TypingChart({ data }: { data: Point[] }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);

  const W = 640;
  const H = 220;
  const PAD_X = 12;
  const PAD_Y = 28;

  const { points, path, area, max, min } = useMemo(() => {
    const max = Math.max(...data.map((d) => d.value), 1);
    const min = Math.min(...data.map((d) => d.value), 0);
    const range = max - min || 1;
    const pts = data.map((d, i) => ({
      ...d,
      x: PAD_X + (i / Math.max(data.length - 1, 1)) * (W - PAD_X * 2),
      y: H - PAD_Y - ((d.value - min) / range) * (H - PAD_Y * 2),
    }));
    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const areaPath = pts.length
      ? `${line} L${pts[pts.length - 1].x.toFixed(1)},${H - PAD_Y} L${PAD_X},${H - PAD_Y} Z`
      : "";
    return { points: pts, path: line, area: areaPath, max, min };
  }, [data]);

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" role="img" aria-label="Typing speed over time">
        <defs>
          <linearGradient id="typingArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(180 243 74 / 0.28)" />
            <stop offset="100%" stopColor="rgb(180 243 74 / 0)" />
          </linearGradient>
          <linearGradient id="typingLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#B4F34A" />
            <stop offset="100%" stopColor="#7AA2FF" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PAD_X}
            x2={W - PAD_X}
            y1={H - PAD_Y - (H - PAD_Y * 2) * f}
            y2={H - PAD_Y - (H - PAD_Y * 2) * f}
            stroke="rgb(53 53 63 / 0.5)"
            strokeDasharray="4 6"
          />
        ))}

        {area && <path d={area} fill="url(#typingArea)" />}

        {path && (
          <motion.path
            d={path}
            fill="none"
            stroke="url(#typingLine)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />
        )}

        {points.map((p, i) => (
          <g key={i}>
            <rect
              x={p.x - (W / data.length) / 2}
              y={0}
              width={W / data.length}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ pointerEvents: "all" }}
            />
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={p.value === 0 ? 0 : 4}
              fill="#B4F34A"
              stroke="#0B0B0F"
              strokeWidth={2}
              initial={reduce ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: p.value === 0 ? 0 : 1, opacity: p.value === 0 ? 0 : 1 }}
              transition={{ delay: 0.5 + i * 0.03, duration: 0.3 }}
            />
            {hover === i && p.value > 0 && (
              <g>
                <line x1={p.x} x2={p.x} y1={p.y} y2={H - PAD_Y} stroke="rgb(180 243 74 / 0.4)" strokeDasharray="2 3" />
                <rect
                  x={Math.min(Math.max(p.x - 34, 0), W - 70)}
                  y={p.y - 34}
                  width={68}
                  height={22}
                  rx={6}
                  fill="#1A1A22"
                  stroke="#35353F"
                />
                <text
                  x={Math.min(Math.max(p.x - 34, 0), W - 70) + 34}
                  y={p.y - 19}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#B4F34A"
                  fontFamily="var(--font-mono)"
                >
                  {p.value} wpm
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>

      <div className="mt-2 flex justify-between px-1 text-[10px] text-faint">
        {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1).map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-faint">
        <span>min {min} wpm</span>
        <span>max {max} wpm</span>
      </div>
    </div>
  );
}