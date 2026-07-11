import { createClient } from "@/lib/supabase/server";
import { relatedTextsToTextLinks } from "@/lib/lessons/lesson-text-links";
import type { TLessonRelatedText, TTextLink } from "@/types/lessons";

export async function getTextsLinkedToLesson(
  relatedTexts: TLessonRelatedText[],
): Promise<TTextLink[]> {
  if (relatedTexts.length === 0) {
    return [];
  }

  const titles = relatedTexts.map((entry) => entry.textTitle);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("texts")
    .select("id, title")
    .in("title", titles);

  if (error || !data) {
    return [];
  }

  const textsByTitle = new Map(
    data.map((row) => [row.title, { id: row.id as string }]),
  );

  return relatedTextsToTextLinks(relatedTexts, textsByTitle);
}
