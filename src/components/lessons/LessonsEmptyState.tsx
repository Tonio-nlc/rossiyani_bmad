import { BookOpen } from "lucide-react";

import { CARD_BASE_CLASS } from "@/components/ui/card-styles";
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
    <div
      className={cn(
        CARD_BASE_CLASS,
        "flex flex-col items-center border-dashed py-12 text-center",
        className,
      )}
    >
      <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-accent-light text-accent">
        <BookOpen className="size-5" aria-hidden="true" />
      </div>
      <p className="text-sm font-bold text-ink">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-3">
        {description}
      </p>
    </div>
  );
}
