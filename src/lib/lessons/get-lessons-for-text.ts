import { createClient } from "@/lib/supabase/server";
import {
  sortLessonLinks,
  textTitleInRelatedTexts,
} from "@/lib/lessons/lesson-text-links";
import type { TLessonLink, TLessonRelatedText } from "@/types/lessons";

interface LessonRow {
  id: string;
  slug: string;
  title: string;
  order_index: number;
  related_texts: TLessonRelatedText[] | null;
  lesson_paths:
    | { slug: string; title: string; color: string }
    | { slug: string; title: string; color: string }[];
}

function resolvePath(
  lessonPaths: LessonRow["lesson_paths"],
): { slug: string; title: string; color: string } {
  return Array.isArray(lessonPaths) ? lessonPaths[0] : lessonPaths;
}

function mapLessonRow(row: LessonRow): TLessonLink {
  const path = resolvePath(row.lesson_paths);

  return {
    lessonId: row.id,
    lessonSlug: row.slug,
    lessonTitle: row.title,
    pathSlug: path.slug,
    pathTitle: path.title,
    pathColor: path.color,
    orderIndex: row.order_index,
  };
}

export async function getLessonsLinkedToText(
  textTitle: string,
): Promise<TLessonLink[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lessons")
    .select(
      "id, slug, title, order_index, related_texts, lesson_paths!inner(slug, title, color)",
    )
    .not("related_texts", "eq", "[]");

  if (error || !data) {
    return [];
  }

  const links = (data as unknown as LessonRow[])
    .filter((row) =>
      textTitleInRelatedTexts(row.related_texts ?? [], textTitle),
    )
    .map(mapLessonRow);

  return sortLessonLinks(links);
}
