import { Skeleton, ListSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-7 w-44 mb-6" />
      <ListSkeleton count={4} />
    </div>
  );
}
