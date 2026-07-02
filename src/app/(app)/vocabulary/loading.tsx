import { Skeleton } from "@/components/ui/skeleton";

export default function VocabularyLoading() {
  return (
    <div className="bg-brand-surface">
      <div className="border-b border-brand-border bg-brand-card px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl space-y-3">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
      </div>
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 md:px-8">
        <Skeleton className="h-8 w-full max-w-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
        <div className="space-y-3 pt-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
