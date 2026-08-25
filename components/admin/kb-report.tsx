'use client';

import { useState } from 'react';
import { revalidateAndFetch } from '../../app/admin/kb/actions';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import type { KBValidationReport } from '@/lib/kb/validate';
import { cn } from '@/lib/utils';

export default function AdminKBReport({
  initialReport,
  initialError,
}: {
  initialReport: KBValidationReport | null;
  initialError: string | null;
}) {
  const [report, setReport] = useState<KBValidationReport | null>(initialReport);
  const [error, setError] = useState<string | null>(initialError);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setBusy(true);
    const res = await revalidateAndFetch();
    if (res.ok && res.report) {
      setReport(res.report);
      setError(null);
    } else {
      setError(res.error ?? 'Unknown error');
    }
    setBusy(false);
  };

  const errors = report?.issues.filter((i) => i.severity === 'error') ?? [];
  const warnings = report?.issues.filter((i) => i.severity === 'warning') ?? [];

  const counts = report
    ? [...Object.entries(report.counts), ['total cards', String(report.totalCards)]]
    : [];

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            Knowledge Base health
          </h1>
          <p className="mt-1 text-sm text-muted">
            Loader count, cross-references and frontmatter integrity.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={busy}>
          <RefreshCw size={16} className={busy ? 'animate-spin' : ''} />
          Re-validate KB
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-coral/25 bg-coral/10 p-4 text-sm text-coral">
          {error}
        </div>
      )}

      {report ? (
        <div className="space-y-6">
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {counts.map(([k, v]) => (
              <div key={k} className="rounded-xl border border-line bg-panel/60 p-4 shadow-card">
                <div className="font-mono text-2xl font-bold text-ink">{v}</div>
                <div className="text-xs uppercase tracking-wide text-faint">{k}</div>
              </div>
            ))}
          </section>

          <section className="rounded-xl border border-line bg-panel/60 p-6 shadow-card">
            <h2 className="mb-2 font-semibold text-ink">Errors · {errors.length}</h2>
            {errors.length === 0 ? (
              <p className="text-sm text-accent">All cross-references resolve. No missing KB content.</p>
            ) : (
              <ul className="space-y-1">
                {errors.map((e, i) => (
                  <li key={i} className="text-sm text-coral">
                    <span className="text-xs font-semibold uppercase">{e.category}:</span> {e.message}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-line bg-panel/60 p-6 shadow-card">
            <h2 className="mb-2 font-semibold text-ink">Warnings / notes · {warnings.length}</h2>
            {warnings.length === 0 ? (
              <p className="text-sm text-muted">No warnings.</p>
            ) : (
              <ul className="space-y-1">
                {warnings.map((w, i) => (
                  <li key={i} className="text-sm text-sun/90">
                    {w.message}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <p className="text-muted">Loading report…</p>
      )}
    </div>
  );
}