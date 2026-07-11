import { BookOpen } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

interface LessonsEmptyStateProps {
  title: string;
  description: string;
  className?: string;
}

export function LessonsEmptyState({
  title,
  description,
  className,
}: LessonsEmptyStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      className={cn("py-12", className)}
      icon={
        <div className="flex size-10 items-center justify-center rounded-lg bg-accent-light text-accent">
          <BookOpen className="size-5" aria-hidden="true" />
        </div>
      }
    />
  );
}
