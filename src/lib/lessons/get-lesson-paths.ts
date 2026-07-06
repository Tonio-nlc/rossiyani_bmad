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

function mapPathRow(row: LessonPathRow): TLessonPath {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    levelRange: row.level_range,
    color: row.color,
    orderIndex: row.order_index,
    lessonCount: row.lessons?.[0]?.count ?? 0,
  };
}

export async function getLessonPaths(): Promise<TLessonPath[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lesson_paths")
    .select("*, lessons(count)")
    .order("order_index", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as LessonPathRow[]).map(mapPathRow);
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
