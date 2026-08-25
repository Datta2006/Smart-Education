import TaskDetailClient from '@/components/task/task-detail-client';

export default function TaskDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <TaskDetailClient id={params.id} />;
}