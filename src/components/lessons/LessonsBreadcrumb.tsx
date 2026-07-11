import Link from "next/link";

import { ContextBar } from "@/components/ui/ContextBar";
import { lessonsIndexHref } from "@/lib/lessons/lesson-nav";
import type { LayoutWidth } from "@/lib/design/layout";
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
  width?: LayoutWidth;
}

export function LessonsBreadcrumb({
  segments,
  from,
  textId,
  className,
  width = "dashboard",
}: LessonsBreadcrumbProps) {
  const lessonsHref = lessonsIndexHref(from, textId);

  return (
    <ContextBar width={width} className={className}>
      <nav aria-label="Fil d'Ariane">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-ink-3">
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
    </ContextBar>
  );
}
