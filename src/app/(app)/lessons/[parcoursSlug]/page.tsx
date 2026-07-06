import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonCard } from "@/components/lessons/LessonCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLessonPathBySlug } from "@/lib/lessons/get-lesson-path-by-slug";
import { createClient } from "@/lib/supabase/server";

export default async function LessonPathPage({
  params,
}: {
  params: Promise<{ parcoursSlug: string }>;
}) {
  const { parcoursSlug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = await getLessonPathBySlug(parcoursSlug, user?.id ?? null);

  if (!path) {
    notFound();
  }

  return (
    <div>
      <div className="border-b border-border bg-surface px-6 py-4 md:px-10">
        <nav className="mx-auto max-w-[1080px] text-[13px] text-ink-3">
          <Link href="/lessons" className="hover:text-ink-2">
            Leçons
          </Link>
          <span style={{ color: "#A8A8A8", margin: "0 6px" }}>·</span>
          <span className="text-ink">{path.title}</span>
        </nav>
      </div>

      <PageHeader
        eyebrow="PARCOURS"
        title={path.title}
        subtitle={path.description}
        badge={
          <span
            className="inline-flex rounded-[5px] px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ backgroundColor: path.color }}
          >
            {path.levelRange}
          </span>
        }
      />

      <div className="mx-auto max-w-3xl space-y-4 px-6 py-10 md:px-10">
        {path.lessons.length === 0 ? (
          <p className="text-sm text-ink-3">
            Les leçons de ce parcours arrivent bientôt.
          </p>
        ) : (
          path.lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              pathSlug={path.slug}
              lesson={lesson}
              pathColor={path.color}
            />
          ))
        )}
      </div>
    </div>
  );
}
