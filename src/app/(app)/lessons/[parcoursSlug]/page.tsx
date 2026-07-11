import { notFound } from "next/navigation";

import { LessonCard } from "@/components/lessons/LessonCard";
import { LessonsBreadcrumb } from "@/components/lessons/LessonsBreadcrumb";
import { LessonsContextBack } from "@/components/lessons/LessonsContextBack";
import { LessonsEmptyState } from "@/components/lessons/LessonsEmptyState";
import { LessonsPathProgress } from "@/components/lessons/LessonsPathProgress";
import { PageBody } from "@/components/ui/PageBody";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLessonPathBySlug } from "@/lib/lessons/get-lesson-path-by-slug";
import { buildLessonsReturnQuery } from "@/lib/lessons/lesson-nav";
import { SECTION_CONTENT_GAP_CLASS } from "@/lib/design/rhythm";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export default async function LessonPathPage({
  params,
  searchParams,
}: {
  params: Promise<{ parcoursSlug: string }>;
  searchParams: Promise<{ from?: string; textId?: string }>;
}) {
  const { parcoursSlug } = await params;
  const query = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = await getLessonPathBySlug(parcoursSlug, user?.id ?? null);

  if (!path) {
    notFound();
  }

  const returnQuery = buildLessonsReturnQuery(query.from, query.textId);

  return (
    <div>
      <LessonsContextBack from={query.from} textId={query.textId} />
      <LessonsBreadcrumb
        segments={[{ label: path.title }]}
        from={query.from}
        textId={query.textId}
      />

      <PageHeader
        eyebrow="PARCOURS"
        title={path.title}
        subtitle={path.description}
        width="content"
        badge={
          <span
            className="inline-flex rounded-[5px] px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ backgroundColor: path.color }}
          >
            {path.levelRange}
          </span>
        }
      />

      <PageBody width="content">
        {path.lessons.length > 0 ? (
          <>
            <LessonsPathProgress
              completedCount={path.completedCount}
              totalCount={path.lessonCount}
              pathColor={path.color}
            />
            <div className={cn("space-y-4", SECTION_CONTENT_GAP_CLASS)}>
              {path.lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  pathSlug={path.slug}
                  lesson={lesson}
                  pathColor={path.color}
                  returnQuery={returnQuery}
                  from={query.from}
                  textId={query.textId}
                />
              ))}
            </div>
          </>
        ) : (
          <LessonsEmptyState
            title="Parcours en préparation"
            description="Les leçons de ce parcours arrivent bientôt. En attendant, explorez les autres parcours disponibles."
          />
        )}
      </PageBody>
    </div>
  );
}
