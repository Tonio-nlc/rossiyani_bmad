import { ParcoursCard } from "@/components/lessons/ParcoursCard";
import { LessonsContextBack } from "@/components/lessons/LessonsContextBack";
import { LessonsEmptyState } from "@/components/lessons/LessonsEmptyState";
import { PageBody } from "@/components/ui/PageBody";
import { PageHeader } from "@/components/ui/PageHeader";
import { CARD_GRID_2COL_CLASS } from "@/lib/design/rhythm";
import { getLessonPaths } from "@/lib/lessons/get-lesson-paths";
import { buildLessonsReturnQuery } from "@/lib/lessons/lesson-nav";
import { createClient } from "@/lib/supabase/server";

export default async function LessonsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; textId?: string }>;
}) {
  const query = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { paths, error } = await getLessonPaths(user?.id ?? null);
  const returnQuery = buildLessonsReturnQuery(query.from, query.textId);

  return (
    <div>
      <LessonsContextBack from={query.from} textId={query.textId} />
      <PageHeader
        eyebrow="APPRENDRE"
        title="Leçons"
        subtitle="Comprendre la logique du russe — pas mémoriser des règles. Chaque leçon part d'un exemple concret pour expliquer pourquoi le russe fonctionne ainsi."
      />

      <PageBody width="dashboard">
        {error ? (
          <div
            className="rounded-[14px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {error}
          </div>
        ) : paths.length === 0 ? (
          <LessonsEmptyState
            title="Aucun parcours disponible"
            description="Les parcours de leçons seront bientôt ajoutés. Revenez plus tard."
          />
        ) : (
          <div className={CARD_GRID_2COL_CLASS}>
            {paths.map((path) => (
              <ParcoursCard
                key={path.id}
                path={path}
                returnQuery={returnQuery}
                from={query.from}
                textId={query.textId}
              />
            ))}
          </div>
        )}
      </PageBody>
    </div>
  );
}
