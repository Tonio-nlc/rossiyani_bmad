import { notFound } from "next/navigation";

import { LessonBlockRenderer } from "@/components/lessons/LessonBlockRenderer";
import { LessonEncounteredTexts } from "@/components/lessons/LessonEncounteredTexts";
import { LessonsBreadcrumb } from "@/components/lessons/LessonsBreadcrumb";
import { LessonsContextBack } from "@/components/lessons/LessonsContextBack";
import { MarkLessonCompleteButton } from "@/components/lessons/MarkLessonCompleteButton";
import {
  LESSON_COLUMN_CLASS,
  LESSON_COMPLETE_CLASS,
  LESSON_EYEBROW_CLASS,
  LESSON_HERO_CLASS,
  LESSON_PAGE_SHELL_CLASS,
  LESSON_TITLE_CLASS,
} from "@/lib/design/lesson-composition";
import { getLessonBySlug } from "@/lib/lessons/get-lesson-by-slug";
import { getTextsLinkedToLesson } from "@/lib/lessons/get-texts-for-lesson";
import { lessonPathHref } from "@/lib/lessons/lesson-nav";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ parcoursSlug: string; lessonSlug: string }>;
  searchParams: Promise<{ from?: string; textId?: string }>;
}) {
  const { parcoursSlug, lessonSlug } = await params;
  const query = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const lesson = await getLessonBySlug(
    parcoursSlug,
    lessonSlug,
    user?.id ?? null,
  );

  if (!lesson) {
    notFound();
  }

  const linkedTexts = await getTextsLinkedToLesson(lesson.relatedTexts);

  return (
    <div>
      <LessonsContextBack from={query.from} textId={query.textId} />
      <LessonsBreadcrumb
        width="reading"
        segments={[
          {
            label: lesson.path.title,
            href: lessonPathHref(lesson.path.slug, query.from, query.textId),
          },
          { label: lesson.title },
        ]}
        from={query.from}
        textId={query.textId}
        variant="lesson"
      />

      <article className={cn(LESSON_COLUMN_CLASS, LESSON_PAGE_SHELL_CLASS)}>
        <header className={cn(LESSON_HERO_CLASS, "mb-10 md:mb-12")}>
          <p className={LESSON_EYEBROW_CLASS}>Leçon {lesson.orderIndex}</p>
          <h1 className={LESSON_TITLE_CLASS}>{lesson.title}</h1>
        </header>

        <LessonBlockRenderer blocks={lesson.contentBlocks} />

        <LessonEncounteredTexts texts={linkedTexts} />

        <div className={cn(LESSON_COMPLETE_CLASS, LESSON_COLUMN_CLASS)}>
          <MarkLessonCompleteButton
            lessonId={lesson.id}
            initialCompleted={lesson.completed}
            isAuthenticated={Boolean(user)}
          />
        </div>
      </article>
    </div>
  );
}
