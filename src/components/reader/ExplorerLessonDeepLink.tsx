import Link from "next/link";

import { BADGE_MUTED_CLASS } from "@/lib/design/classes";
import { EXPLORER_SPACE } from "@/lib/design/reader-composition";
import { lessonHref } from "@/lib/lessons/lesson-nav";
import type { TLessonLink } from "@/types/lessons";
import { cn } from "@/lib/utils";

interface ExplorerLessonDeepLinkProps {
  lesson: TLessonLink;
  textId: string;
}

/** Carte secondaire discrète — badge → titre → contexte → CTA */
export function ExplorerLessonDeepLink({
  lesson,
  textId,
}: ExplorerLessonDeepLinkProps) {
  return (
    <section
      className={cn(
        EXPLORER_SPACE.afterSuffix,
        "rounded-[10px] border border-border bg-bg/60 p-4",
      )}
    >
      <span className={cn(BADGE_MUTED_CLASS, "inline-flex")}>
        Approfondir
      </span>
      <p className="mt-3 text-sm font-semibold leading-snug text-ink">
        {lesson.lessonTitle}
      </p>
      <p className="mt-1 text-xs text-ink-3">{lesson.pathTitle}</p>
      <Link
        href={lessonHref(lesson.pathSlug, lesson.lessonSlug, "reader", textId)}
        className="mt-3 inline-block text-[13px] font-semibold text-accent hover:underline"
      >
        Ouvrir la leçon →
      </Link>
    </section>
  );
}
