import { Skeleton } from "@/components/ui/skeleton";

export default function SubscriptionLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Plan cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            {/* Plan name */}
            <Skeleton className="h-6 w-24 mx-auto" />
            {/* Price */}
            <Skeleton className="h-9 w-28 mx-auto" />

            {/* Features list */}
            <div className="space-y-2 pt-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-start gap-2">
                  <Skeleton className="h-4 w-4 mt-0.5 shrink-0" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>

            {/* Button */}
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
