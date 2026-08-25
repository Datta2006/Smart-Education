'use client';

import { createContext, useContext } from 'react';
import type { KBSnapshot } from '../lib/kb/loader';

const KBContext = createContext<KBSnapshot | null>(null);

export function KBProvider({
  children,
  initialValue,
}: {
  children: React.ReactNode;
  initialValue: KBSnapshot;
}) {
  return (
    <KBContext.Provider value={initialValue}>
      {children}
    </KBContext.Provider>
  );
}

export function useKB(): KBSnapshot {
  const context = useContext(KBContext);
  if (!context) {
    throw new Error('useKB must be used within a KBProvider');
  }
  return context;
}
