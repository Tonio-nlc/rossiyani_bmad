import Link from "next/link";

import { CARD_BASE_CLASS } from "@/components/ui/card-styles";
import { CTA_LINK_CLASS } from "@/lib/design/classes";
import { lessonHref } from "@/lib/lessons/lesson-nav";
import type { TLessonSummary } from "@/types/lessons";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  pathSlug: string;
  lesson: TLessonSummary;
  pathColor: string;
  returnQuery?: string;
  from?: string;
  textId?: string;
}

export function LessonCard({
  pathSlug,
  lesson,
  pathColor,
  returnQuery = "",
  from,
  textId,
}: LessonCardProps) {
  const href =
    returnQuery.length > 0
      ? `/lessons/${pathSlug}/${lesson.slug}${returnQuery}`
      : lessonHref(pathSlug, lesson.slug, from, textId);
  const ctaLabel = lesson.completed ? "Revoir" : "Commencer";

  return (
    <Link
      href={href}
      className={cn(CARD_BASE_CLASS, "flex flex-col gap-3")}
      style={{ borderLeftWidth: 3, borderLeftColor: pathColor }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold tracking-[0.08em] text-ink-3 uppercase">
            Leçon {lesson.orderIndex}
          </p>
          <h3 className="mt-1 text-sm font-bold text-ink">{lesson.title}</h3>
          {lesson.summary ? (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-3">
              {lesson.summary}
            </p>
          ) : null}
        </div>
        {lesson.completed ? (
          <span className="shrink-0 rounded-[5px] bg-green/10 px-2 py-0.5 text-[10px] font-bold text-green">
            Lu
          </span>
        ) : null}
      </div>

      <span className={CTA_LINK_CLASS}>
        {ctaLabel} →
      </span>
    </Link>
  );
}
