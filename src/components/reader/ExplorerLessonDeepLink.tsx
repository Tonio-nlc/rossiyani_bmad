import Link from "next/link";

import { lessonHref } from "@/lib/lessons/lesson-nav";
import type { TLessonLink } from "@/types/lessons";

interface ExplorerLessonDeepLinkProps {
  lesson: TLessonLink;
  textId: string;
}

export function ExplorerLessonDeepLink({
  lesson,
  textId,
}: ExplorerLessonDeepLinkProps) {
  return (
    <section className="mt-5 rounded-[10px] border border-border/60 bg-bg/50 px-4 py-3.5">
      <p className="text-[11px] font-bold tracking-[0.04em] text-ink-3">
        📖 Approfondir ce concept
      </p>
      <p className="mt-2 text-[13px] font-medium leading-snug text-ink">
        {lesson.lessonTitle}
      </p>
      <Link
        href={lessonHref(lesson.pathSlug, lesson.lessonSlug, "reader", textId)}
        className="mt-2 inline-block text-[13px] font-semibold text-accent hover:underline"
      >
        Ouvrir la leçon →
      </Link>
    </section>
  );
}
