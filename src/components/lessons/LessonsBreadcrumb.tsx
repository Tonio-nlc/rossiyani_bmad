import Link from "next/link";

import { lessonsIndexHref } from "@/lib/lessons/lesson-nav";
import { cn } from "@/lib/utils";

export interface LessonsBreadcrumbSegment {
  label: string;
  href?: string;
}

interface LessonsBreadcrumbProps {
  segments: LessonsBreadcrumbSegment[];
  from?: string;
  textId?: string;
  className?: string;
  maxWidthClass?: string;
}

export function LessonsBreadcrumb({
  segments,
  from,
  textId,
  className,
  maxWidthClass = "max-w-dashboard",
}: LessonsBreadcrumbProps) {
  const lessonsHref = lessonsIndexHref(from, textId);

  return (
    <nav
      className={cn(
        "border-b border-border bg-surface px-4 py-3 md:px-10",
        className,
      )}
      aria-label="Fil d'Ariane"
    >
      <ol
        className={cn(
          "mx-auto flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-ink-3",
          maxWidthClass,
        )}
      >
        <li>
          <Link href={lessonsHref} className="hover:text-ink-2">
            Leçons
          </Link>
        </li>
        {segments.map((segment, index) => (
          <li key={`${segment.label}-${index}`} className="flex items-center gap-1.5">
            <span aria-hidden="true">·</span>
            {segment.href ? (
              <Link href={segment.href} className="hover:text-ink-2">
                {segment.label}
              </Link>
            ) : (
              <span className={cn(index === segments.length - 1 && "text-ink")}>
                {segment.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
