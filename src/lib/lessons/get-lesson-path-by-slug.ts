import { createClient } from "@/lib/supabase/server";
import { extractLessonSummary } from "@/lib/lessons/get-lesson-paths";
import type { TContentBlock, TLessonPathWithLessons } from "@/types/lessons";

interface LessonRow {
  id: string;
  slug: string;
  title: string;
  order_index: number;
  content_blocks: TContentBlock[];
}

interface PathRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  level_range: string;
  color: string;
  order_index: number;
  lessons: LessonRow[];
}

export async function getLessonPathBySlug(
  pathSlug: string,
  userId: string | null,
): Promise<TLessonPathWithLessons | null> {
  const supabase = await createClient();

  const { data: pathRow, error } = await supabase
    .from("lesson_paths")
    .select("*, lessons(id, slug, title, order_index, content_blocks)")
    .eq("slug", pathSlug)
    .maybeSingle();

  if (error || !pathRow) {
    return null;
  }

  const row = pathRow as PathRow;
  const sortedLessons = [...row.lessons].sort(
    (a, b) => a.order_index - b.order_index,
  );
  const lessonIds = row.lessons.map((lesson) => lesson.id);

  let completedIds = new Set<string>();

  if (userId && lessonIds.length > 0) {
    const { data: progressRows } = await supabase
      .from("user_lesson_progress")
      .select("lesson_id, completed")
      .eq("user_id", userId)
      .in("lesson_id", lessonIds)
      .eq("completed", true);

    completedIds = new Set(
      (progressRows ?? []).map((progress) => progress.lesson_id as string),
    );
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    levelRange: row.level_range,
    color: row.color,
    orderIndex: row.order_index,
    lessonCount: sortedLessons.length,
    completedCount: completedIds.size,
    lessons: sortedLessons.map((lesson) => ({
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      orderIndex: lesson.order_index,
      summary: extractLessonSummary(lesson.content_blocks),
      completed: completedIds.has(lesson.id),
    })),
  };
}
