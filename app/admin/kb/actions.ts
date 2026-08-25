'use server';

import { revalidateKB, getKBReport } from '@/lib/kb/registry';
import type { KBValidationReport } from '@/lib/kb/validate';

export async function revalidateAndFetch(): Promise<{ ok: boolean; report?: KBValidationReport; error?: string }> {
  revalidateKB();
  const res = await getKBReport();
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, report: res.value };
}