"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { FocusData, FocusStats } from "@/lib/focus/types";
import {
  loadFocusData,
  saveFocusData,
  computeFocusStats,
  makeFocusSession,
} from "@/lib/focus/storage";

interface FocusContextType {
  data: FocusData;
  stats: FocusStats;
  addSession: (durationMin: number, completed: boolean) => void;
}

const FocusContext = createContext<FocusContextType | null>(null);

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FocusData>({ sessions: [] });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(loadFocusData());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveFocusData(data);
  }, [data, hydrated]);

  const stats = useMemo(() => computeFocusStats(data), [data]);

  const addSession = (durationMin: number, completed: boolean) => {
    setData((prev) => ({
      sessions: [makeFocusSession(durationMin, completed), ...prev.sessions].slice(
        0,
        200
      ),
    }));
  };

  return (
    <FocusContext.Provider value={{ data, stats, addSession }}>
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus(): FocusContextType {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error("useFocus must be used within a FocusProvider");
  return ctx;
}
