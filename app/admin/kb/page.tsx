import { getKBReport } from '@/lib/kb/registry';
import AdminKBReport from '@/components/admin/kb-report';

export default async function AdminKBPage() {
  const res = await getKBReport();

  if (!res.ok) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Knowledge Base health
        </h1>
        <div className="mt-4 rounded-xl border border-coral/25 bg-coral/10 p-4 text-sm text-coral">
          Failed to load KB: {res.error}
        </div>
      </div>
    );
  }

  return <AdminKBReport initialReport={res.value} initialError={null} />;
}