import { getCardById } from '@/lib/kb/registry';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui';

export default async function CardDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const res = await getCardById(params.id);

  if (!res.ok) {
    notFound();
  }

  const card = res.value;

  return (
    <main className="mx-auto min-h-screen max-w-3xl bg-base px-6 py-10 text-ink">
      <div className="mb-8">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
          <Badge variant="info" size="sm">
            {card.type.replace('-', ' ')}
          </Badge>
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {card.title}
        </h1>
        {card.description && <p className="mt-3 text-lg text-muted">{card.description}</p>}
      </div>

      <article className="whitespace-pre-wrap leading-relaxed text-ink/90">{card.content}</article>

      {card.estimatedHours && (
        <div className="mt-10 rounded-xl border border-sky/25 bg-sky/10 p-4 text-sm text-sky">
          Estimated time: {card.estimatedHours}h
        </div>
      )}
    </main>
  );
}