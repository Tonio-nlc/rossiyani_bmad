import Link from "next/link";

import { LessonsPathProgress } from "@/components/lessons/LessonsPathProgress";
import { CARD_HUB_CLASS } from "@/components/ui/card-styles";
import { lessonPathHref } from "@/lib/lessons/lesson-nav";
import type { TLessonPath } from "@/types/lessons";
import { cn } from "@/lib/utils";

interface ParcoursCardProps {
  path: TLessonPath;
  returnQuery?: string;
  from?: string;
  textId?: string;
}

export function ParcoursCard({
  path,
  returnQuery = "",
  from,
  textId,
}: ParcoursCardProps) {
  const href =
    returnQuery.length > 0
      ? `/lessons/${path.slug}${returnQuery}`
      : lessonPathHref(path.slug, from, textId);

  const hasLessons = path.lessonCount > 0;
  const isComplete =
    hasLessons && path.completedCount >= path.lessonCount;

  return (
    <Link
      href={href}
      className={cn(CARD_HUB_CLASS, "gap-3")}
      style={{ borderLeftWidth: 3, borderLeftColor: path.color }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold text-ink">{path.title}</h3>
        {isComplete ? (
          <span className="shrink-0 rounded-[5px] bg-green/10 px-2 py-0.5 text-[10px] font-bold text-green">
            Terminé
          </span>
        ) : null}
      </div>

      <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-ink-3">
        {path.description}
      </p>

      <div className="mt-auto space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-[5px] bg-bg px-2 py-0.5 text-[10px] font-bold text-ink-3">
            {path.levelRange}
          </span>
          <span className="rounded-[5px] bg-bg px-2 py-0.5 text-[10px] font-bold text-ink-3">
            {hasLessons
              ? `${path.lessonCount} leçon${path.lessonCount > 1 ? "s" : ""}`
              : "Bientôt disponible"}
          </span>
        </div>

        {hasLessons && path.completedCount > 0 ? (
          <LessonsPathProgress
            completedCount={path.completedCount}
            totalCount={path.lessonCount}
            pathColor={path.color}
          />
        ) : null}
      </div>
    </Link>
  );
}
