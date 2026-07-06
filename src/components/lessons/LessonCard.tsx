import Link from "next/link";

import { CARD_BASE_CLASS } from "@/components/ui/card-styles";
import type { TLessonSummary } from "@/types/lessons";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  pathSlug: string;
  lesson: TLessonSummary;
  pathColor: string;
}

export function LessonCard({ pathSlug, lesson, pathColor }: LessonCardProps) {
  const ctaLabel = lesson.completed ? "Revoir" : "Commencer";

  return (
    <div
      className={cn(CARD_BASE_CLASS, "flex flex-col gap-3")}
      style={{ borderLeftWidth: 3, borderLeftColor: pathColor }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-ink">{lesson.title}</h3>
          {lesson.summary ? (
            <p className="mt-2 text-xs leading-relaxed text-ink-3">
              {lesson.summary}
            </p>
          ) : null}
        </div>
        {lesson.completed ? (
          <span className="shrink-0 rounded-[5px] bg-[#10B981]/10 px-2 py-0.5 text-[10px] font-bold text-[#10B981]">
            Lu
          </span>
        ) : null}
      </div>

      <Link
        href={`/lessons/${pathSlug}/${lesson.slug}`}
        className="text-[13px] font-semibold hover:underline"
        style={{ color: "#4F46E5" }}
      >
        {ctaLabel} →
      </Link>
    </div>
  );
}
