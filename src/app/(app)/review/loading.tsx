import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewLoading() {
  return (
    <div className="bg-bg">
      <div className="border-b border-border bg-surface px-4 py-8 md:px-8">
        <div className="mx-auto max-w-content">
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <div className="mx-auto max-w-content space-y-4 px-4 py-8 md:px-8">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  );
}
