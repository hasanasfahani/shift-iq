import { Skeleton, ListSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-36" />
      </div>
      <ListSkeleton count={3} />
    </div>
  );
}
