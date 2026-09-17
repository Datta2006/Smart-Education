"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CourseProgress, CourseTrack } from "@/lib/courses/progress";
import {
  loadCourseProgress,
  saveCourseProgress,
  toggleItem,
  isCompleted,
  overallStats,
} from "@/lib/courses/progress";

interface CourseContextType {
  progress: CourseProgress;
  hydrated: boolean;
  toggle: (track: CourseTrack, itemId: string) => void;
  done: (track: CourseTrack, itemId: string) => boolean;
  overall: { done: number; total: number; pct: number };
}

const CourseContext = createContext<CourseContextType | null>(null);

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<CourseProgress>({
    completed: [],
    updatedAt: "",
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(loadCourseProgress());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCourseProgress(progress);
  }, [progress, hydrated]);

  const value = useMemo<CourseContextType>(
    () => ({
      progress,
      hydrated,
      toggle: (track, itemId) => setProgress((p) => toggleItem(p, track, itemId)),
      done: (track, itemId) => isCompleted(progress, track, itemId),
      overall: (() => {
        const s = overallStats(progress);
        return { done: s.done, total: s.total, pct: s.pct };
      })(),
    }),
    [progress, hydrated]
  );

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

export function useCourses(): CourseContextType {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourses must be used within a CourseProvider");
  return ctx;
}
