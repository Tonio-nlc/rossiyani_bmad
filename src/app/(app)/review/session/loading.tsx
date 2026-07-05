import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewSessionLoading() {
  return (
    <div className="bg-brand-surface">
      <div className="border-b border-brand-border bg-brand-card px-4 py-6 md:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="mt-8 h-10 w-32" />
        <div className="mt-10 flex gap-3">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  );
}
