import { Skeleton, ListSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-7 w-36 mb-6" />
      <div className="flex gap-3 mb-6">
        <Skeleton className="h-10 w-36 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <ListSkeleton count={5} />
    </div>
  );
}
