"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { TypingSession, TypingTestResult, TypingStats } from "@/lib/typing/types";
import {
  loadTypingSession,
  saveTypingSession,
  computeStats,
} from "@/lib/typing/storage";

interface TypingContextType {
  session: TypingSession;
  stats: TypingStats;
  addTest: (result: Omit<TypingTestResult, "id" | "date">) => void;
  clearHistory: () => void;
}

const TypingContext = createContext<TypingContextType | null>(null);

export function TypingProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<TypingSession>({ tests: [] });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSession(loadTypingSession());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveTypingSession(session);
  }, [session, hydrated]);

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

  return (
    <TypingContext.Provider value={{ session, stats, addTest, clearHistory }}>
      {children}
    </TypingContext.Provider>
  );
}

export function useTyping(): TypingContextType {
  const ctx = useContext(TypingContext);
  if (!ctx) throw new Error("useTyping must be used within a TypingProvider");
  return ctx;
}
