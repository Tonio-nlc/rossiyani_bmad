import { notFound } from "next/navigation";

import { LessonBlockRenderer } from "@/components/lessons/LessonBlockRenderer";
import { LessonsBreadcrumb } from "@/components/lessons/LessonsBreadcrumb";
import { LessonsContextBack } from "@/components/lessons/LessonsContextBack";
import { MarkLessonCompleteButton } from "@/components/lessons/MarkLessonCompleteButton";
import { getLessonBySlug } from "@/lib/lessons/get-lesson-by-slug";
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

  return (
    <div>
      <LessonsContextBack from={query.from} textId={query.textId} />
      <LessonsBreadcrumb
        maxWidthClass="max-w-3xl"
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

      <article className="mx-auto max-w-3xl px-4 py-10 md:px-10">
        <p className="text-[10px] font-bold tracking-[0.08em] text-ink-3 uppercase">
          Leçon {lesson.orderIndex}
        </p>
        <h1 className="mt-2 font-serif text-3xl text-ink">{lesson.title}</h1>

        <div className="mt-8">
          <LessonBlockRenderer blocks={lesson.contentBlocks} />
        </div>

        <div className="mt-10 border-t border-border pt-8">
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
