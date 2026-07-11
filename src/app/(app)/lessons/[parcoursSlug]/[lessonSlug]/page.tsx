import { notFound } from "next/navigation";

import { LessonBlockRenderer } from "@/components/lessons/LessonBlockRenderer";
import { LessonEncounteredTexts } from "@/components/lessons/LessonEncounteredTexts";
import { LessonsBreadcrumb } from "@/components/lessons/LessonsBreadcrumb";
import { LessonsContextBack } from "@/components/lessons/LessonsContextBack";
import { MarkLessonCompleteButton } from "@/components/lessons/MarkLessonCompleteButton";
import { getLessonBySlug } from "@/lib/lessons/get-lesson-by-slug";
import { getTextsLinkedToLesson } from "@/lib/lessons/get-texts-for-lesson";
import { lessonPathHref } from "@/lib/lessons/lesson-nav";
import { createClient } from "@/lib/supabase/server";

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
      />

      <article className="mx-auto max-w-reading bg-surface px-4 py-12 md:px-12 md:py-16">
        <header className="mx-auto mb-16 max-w-reading border-b border-border/70 pb-12 md:mb-20 md:pb-14">
          <p className="text-[10px] font-bold tracking-[0.1em] text-ink-3 uppercase">
            Leçon {lesson.orderIndex}
          </p>
          <h1 className="mt-4 font-serif text-[2rem] leading-[1.2] text-ink md:text-[2.75rem] md:leading-[1.15]">
            {lesson.title}
          </h1>
        </header>

        <LessonBlockRenderer blocks={lesson.contentBlocks} />

        <LessonEncounteredTexts texts={linkedTexts} />

        <div className="mx-auto mt-16 max-w-reading border-t border-border/70 pt-10 md:mt-20 md:pt-12">
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
