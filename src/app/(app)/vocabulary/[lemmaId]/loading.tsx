import { Skeleton } from "@/components/ui/skeleton";

export default function VocabularyEntryLoading() {
  return (
    <div className="bg-bg">
      <div className="border-b border-border bg-surface px-4 py-8 md:px-8">
        <div className="mx-auto max-w-content space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-64" />
        </div>
      </div>
      <div className="mx-auto max-w-content space-y-6 px-4 py-8 md:px-8">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}
