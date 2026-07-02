import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { TText, TUserProgress } from "@/types/reader";

interface TextRow {
  id: string;
  title: string;
  content: string;
  content_annotated: TText["contentAnnotated"];
  level: TText["level"];
  collection: string | null;
  word_count: number | null;
  reading_time_minutes: number | null;
}

interface ProgressRow {
  percent_read: number;
  last_sentence_index: number;
  completed_at: string | null;
}

function mapTextRow(row: TextRow): TText {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    contentAnnotated: row.content_annotated,
    level: row.level,
    collection: row.collection ?? "",
    wordCount: row.word_count ?? 0,
    readingTimeMinutes: row.reading_time_minutes ?? 0,
  };
}

export async function getTextById(
  textId: string,
  userId: string,
): Promise<{ text: TText; userProgress: TUserProgress | null } | null> {
  const supabase = await createClient();

  const { data: textRow, error } = await supabase
    .from("texts")
    .select("*")
    .eq("id", textId)
    .maybeSingle();

  if (error || !textRow) {
    return null;
  }

  const { data: progressRow } = await supabase
    .from("user_progress")
    .select("percent_read, last_sentence_index, completed_at")
    .eq("user_id", userId)
    .eq("text_id", textId)
    .maybeSingle();

  const progress = progressRow as ProgressRow | null;

  return {
    text: mapTextRow(textRow as TextRow),
    userProgress: progress
      ? {
          percentRead: progress.percent_read,
          lastSentenceIndex: progress.last_sentence_index,
          completedAt: progress.completed_at,
        }
      : null,
  };
}

export async function getTextByIdOrNotFound(textId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const result = await getTextById(textId, user.id);

  if (!result) {
    notFound();
  }

  return result;
}
