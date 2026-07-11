import { createClient } from "@/lib/supabase/server";
import type { TContentBlock, TLessonPath } from "@/types/lessons";

interface LessonPathRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  level_range: string;
  color: string;
  order_index: number;
  lessons: { count: number }[];
}

export interface TLessonPathsResult {
  paths: TLessonPath[];
  error: string | null;
}

function mapPathRow(
  row: LessonPathRow,
  completedByPath: Map<string, number>,
): TLessonPath {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    levelRange: row.level_range,
    color: row.color,
    orderIndex: row.order_index,
    lessonCount: row.lessons?.[0]?.count ?? 0,
    completedCount: completedByPath.get(row.id) ?? 0,
  };
}

async function getCompletedCountByPath(
  userId: string,
): Promise<Map<string, number>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id, lessons!inner(path_id)")
    .eq("user_id", userId)
    .eq("completed", true);

  if (error || !data) {
    return new Map();
  }

  const counts = new Map<string, number>();

  for (const row of data) {
    const lesson = row.lessons as { path_id: string } | { path_id: string }[];
    const pathId = Array.isArray(lesson) ? lesson[0]?.path_id : lesson.path_id;

    if (!pathId) {
      continue;
    }

    counts.set(pathId, (counts.get(pathId) ?? 0) + 1);
  }

  return counts;
}

export async function getLessonPaths(
  userId: string | null = null,
): Promise<TLessonPathsResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lesson_paths")
    .select("*, lessons(count)")
    .order("order_index", { ascending: true });

  if (error) {
    return {
      paths: [],
      error: "Impossible de charger les parcours de leçons.",
    };
  }

  const completedByPath = userId ? await getCompletedCountByPath(userId) : new Map();

  return {
    paths: (data as LessonPathRow[]).map((row) =>
      mapPathRow(row, completedByPath),
    ),
    error: null,
  };
}

export function extractLessonSummary(contentBlocks: TContentBlock[]): string {
  const firstParagraph = contentBlocks.find(
    (block): block is Extract<TContentBlock, { type: "paragraph" }> =>
      block.type === "paragraph",
  );

  if (!firstParagraph) {
    return "";
  }

  const text = firstParagraph.text.trim();

  if (text.length <= 120) {
    return text;
  }

  return `${text.slice(0, 117)}…`;
}

export function countCompletedLessons(
  lessons: { completed: boolean }[],
): number {
  return lessons.filter((lesson) => lesson.completed).length;
}
