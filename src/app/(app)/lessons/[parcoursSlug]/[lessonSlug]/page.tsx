import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonBlockRenderer } from "@/components/lessons/LessonBlockRenderer";
import { MarkLessonCompleteButton } from "@/components/lessons/MarkLessonCompleteButton";
import { getLessonBySlug } from "@/lib/lessons/get-lesson-by-slug";
import { createClient } from "@/lib/supabase/server";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ parcoursSlug: string; lessonSlug: string }>;
}) {
  const { parcoursSlug, lessonSlug } = await params;
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
      <div className="border-b border-border bg-surface px-6 py-4 md:px-10">
        <nav className="mx-auto max-w-3xl text-[13px] text-ink-3">
          <Link href="/lessons" className="hover:text-ink-2">
            Leçons
          </Link>
          <span style={{ color: "#A8A8A8", margin: "0 6px" }}>·</span>
          <Link
            href={`/lessons/${lesson.path.slug}`}
            className="hover:text-ink-2"
          >
            {lesson.path.title}
          </Link>
          <span style={{ color: "#A8A8A8", margin: "0 6px" }}>·</span>
          <span className="font-russian text-ink">{lesson.title}</span>
        </nav>
      </div>

      <article className="mx-auto max-w-3xl px-6 py-10 md:px-10">
        <h1 className="font-serif text-3xl text-ink">{lesson.title}</h1>

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
