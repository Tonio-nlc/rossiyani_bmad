import { createClient } from "@/lib/supabase/server";
import type { TContentBlock, TLesson } from "@/types/lessons";

interface LessonRow {
  id: string;
  slug: string;
  title: string;
  order_index: number;
  content_blocks: TContentBlock[];
  lesson_paths:
    | {
        slug: string;
        title: string;
        color: string;
      }
    | {
        slug: string;
        title: string;
        color: string;
      }[];
}

function resolvePath(
  lessonPaths: LessonRow["lesson_paths"],
): { slug: string; title: string; color: string } {
  return Array.isArray(lessonPaths) ? lessonPaths[0] : lessonPaths;
}

export async function getLessonBySlug(
  pathSlug: string,
  lessonSlug: string,
  userId: string | null,
): Promise<TLesson | null> {
  const supabase = await createClient();

  const { data: lessonRow, error } = await supabase
    .from("lessons")
    .select(
      "id, slug, title, order_index, content_blocks, lesson_paths!inner(slug, title, color)",
    )
    .eq("slug", lessonSlug)
    .eq("lesson_paths.slug", pathSlug)
    .maybeSingle();

  if (error || !lessonRow) {
    return null;
  }

  const row = lessonRow as unknown as LessonRow;
  const path = resolvePath(row.lesson_paths);

  let completed = false;

  if (userId) {
    const { data: progressRow } = await supabase
      .from("user_lesson_progress")
      .select("completed")
      .eq("user_id", userId)
      .eq("lesson_id", row.id)
      .maybeSingle();

    completed = progressRow?.completed === true;
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    orderIndex: row.order_index,
    contentBlocks: row.content_blocks,
    path: {
      slug: path.slug,
      title: path.title,
      color: path.color,
    },
    completed,
  };
}
