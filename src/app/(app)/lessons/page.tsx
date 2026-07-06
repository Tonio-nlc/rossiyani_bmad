import { ParcoursCard } from "@/components/lessons/ParcoursCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLessonPaths } from "@/lib/lessons/get-lesson-paths";

export default async function LessonsPage() {
  const paths = await getLessonPaths();

  return (
    <div>
      <PageHeader
        eyebrow="APPRENDRE"
        title="Leçons"
        subtitle="Comprendre la logique du russe — pas mémoriser des règles. Chaque leçon part d'un exemple concret pour expliquer pourquoi le russe fonctionne ainsi."
      />

      <div className="mx-auto max-w-[1080px] px-6 py-10 md:px-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {paths.map((path) => (
            <ParcoursCard key={path.id} path={path} />
          ))}
        </div>
      </div>
    </div>
  );
}
