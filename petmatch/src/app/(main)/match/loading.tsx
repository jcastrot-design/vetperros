import { Skeleton } from "@/components/ui/skeleton";

export default function MatchLoading() {
  return (
    <div className="flex flex-col items-center space-y-6">
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-[400px] w-full max-w-sm rounded-2xl" />
      <div className="flex gap-4">
        <Skeleton className="h-14 w-14 rounded-full" />
        <Skeleton className="h-14 w-14 rounded-full" />
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>
    </div>
  );
}
