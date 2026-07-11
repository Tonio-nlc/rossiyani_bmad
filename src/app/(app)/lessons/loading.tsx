import { Skeleton } from "@/components/ui/skeleton";

export default function LessonsLoading() {
  return (
    <div>
      <div className="border-b border-border bg-surface px-4 py-8 md:px-10">
        <div className="mx-auto max-w-dashboard space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
      </div>
      <div className="mx-auto max-w-dashboard grid grid-cols-1 gap-4 px-4 py-10 md:grid-cols-2 md:px-10">
        <Skeleton className="h-44 w-full rounded-[14px]" />
        <Skeleton className="h-44 w-full rounded-[14px]" />
        <Skeleton className="h-44 w-full rounded-[14px]" />
        <Skeleton className="h-44 w-full rounded-[14px]" />
      </div>
    </div>
  );
}
