import { Skeleton, ListSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-10 w-80 mb-6 rounded-xl" />
      <ListSkeleton count={5} />
    </div>
  );
}
