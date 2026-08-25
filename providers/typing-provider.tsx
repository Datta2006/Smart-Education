"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { TypingSession, TypingTestResult, FocusData, TypingStats } from "@/lib/typing/types";
import {
  loadTypingSession,
  saveTypingSession,
  loadFocusData,
  saveFocusData,
  computeStats,
} from "@/lib/typing/storage";

interface TypingContextType {
  session: TypingSession;
  stats: TypingStats;
  focus: FocusData;
  addTest: (result: Omit<TypingTestResult, "id" | "date">) => void;
  clearHistory: () => void;
  addFocusSession: (durationMin: number, completed: boolean) => void;
}

const TypingContext = createContext<TypingContextType | null>(null);

export function TypingProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<TypingSession>({ tests: [] });
  const [focus, setFocus] = useState<FocusData>({ sessions: [] });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSession(loadTypingSession());
    setFocus(loadFocusData());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveTypingSession(session);
  }, [session, hydrated]);

  useEffect(() => {
    if (hydrated) saveFocusData(focus);
  }, [focus, hydrated]);

  const stats = useMemo(() => computeStats(session), [session]);

  const addTest = (result: Omit<TypingTestResult, "id" | "date">) => {
    const entry: TypingTestResult = {
      ...result,
      id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      date: new Date().toISOString(),
    };
    setSession((prev) => ({ tests: [entry, ...prev.tests].slice(0, 500) }));
  };

  const clearHistory = () => setSession({ tests: [] });

  const addFocusSession = (durationMin: number, completed: boolean) => {
    const entry = {
      id: `f_${Date.now()}`,
      date: new Date().toISOString(),
      durationMin,
      completed,
    };
    setFocus((prev) => ({ sessions: [entry, ...prev.sessions].slice(0, 200) }));
  };

  return (
    <TypingContext.Provider
      value={{ session, stats, focus, addTest, clearHistory, addFocusSession }}
    >
      {children}
    </TypingContext.Provider>
  );
}

export function useTyping(): TypingContextType {
  const ctx = useContext(TypingContext);
  if (!ctx) throw new Error("useTyping must be used within a TypingProvider");
  return ctx;
}