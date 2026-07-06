import { getReviewCount } from "@/lib/review/get-review-count";
import { createClient } from "@/lib/supabase/server";
import type {
  THomeCurrentReading,
  THomeData,
  THomeRecentText,
} from "@/types/home";

interface TextRow {
  id: string;
  title: string;
  level: string;
  collection: string | null;
  word_count: number | null;
  reading_time_minutes: number | null;
}

interface ProgressWithTextRow {
  percent_read: number;
  words_encountered: number | null;
  last_read_at: string | null;
  completed_at: string | null;
  texts: TextRow | TextRow[] | null;
}

function mapTextRow(text: TextRow): THomeRecentText {
  return {
    id: text.id,
    title: text.title,
    level: text.level,
    collection: text.collection ?? "",
    wordCount: text.word_count ?? 0,
    readingTimeMinutes: text.reading_time_minutes ?? 0,
    percentRead: 0,
  };
}

function unwrapText(
  texts: TextRow | TextRow[] | null,
): TextRow | null {
  if (!texts) {
    return null;
  }

  return Array.isArray(texts) ? (texts[0] ?? null) : texts;
}

export async function getHomeData(userId: string): Promise<THomeData> {
  const supabase = await createClient();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    { data: currentProgress },
    { data: recentProgress },
    { count: wordsCount },
    { data: allProgress },
    reviewCount,
  ] = await Promise.all([
    supabase
      .from("user_progress")
      .select(
        `
        percent_read,
        texts (
          id,
          title,
          level,
          collection,
          word_count,
          reading_time_minutes
        )
      `,
      )
      .eq("user_id", userId)
      .is("completed_at", null)
      .not("last_read_at", "is", null)
      .order("last_read_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("user_progress")
      .select(
        `
        percent_read,
        last_read_at,
        texts (
          id,
          title,
          level,
          collection,
          word_count,
          reading_time_minutes
        )
      `,
      )
      .eq("user_id", userId)
      .not("last_read_at", "is", null)
      .order("last_read_at", { ascending: false })
      .limit(3),
    supabase
      .from("user_vocabulary")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("user_progress")
      .select("words_encountered, last_read_at")
      .eq("user_id", userId),
    getReviewCount(userId),
  ]);

  let currentReading: THomeCurrentReading | null = null;

  const currentRow = currentProgress as ProgressWithTextRow | null;
  const currentText = unwrapText(currentRow?.texts ?? null);

  if (currentRow && currentText && currentRow.percent_read > 0) {
    currentReading = {
      text: mapTextRow(currentText),
      percentRead: currentRow.percent_read,
    };
  }

  const recentTexts = ((recentProgress as ProgressWithTextRow[] | null) ?? [])
    .map((row) => {
      const text = unwrapText(row.texts);

      if (!text) {
        return null;
      }

      return {
        ...mapTextRow(text),
        percentRead: row.percent_read,
      };
    })
    .filter((item): item is THomeRecentText => item !== null);

  const progressRows = allProgress ?? [];
  const wordsExploredTotal = progressRows.reduce(
    (total, row) => total + (row.words_encountered ?? 0),
    0,
  );
  const wordsToday = progressRows.reduce((total, row) => {
    if (!row.last_read_at) {
      return total;
    }

    const lastReadAt = new Date(row.last_read_at);

    if (lastReadAt < startOfToday) {
      return total;
    }

    return total + (row.words_encountered ?? 0);
  }, 0);

  return {
    currentReading,
    recentTexts,
    wordsCount: wordsCount ?? 0,
    reviewCount: reviewCount.due,
    streak: 1,
    wordsExploredTotal,
    wordsToday,
  };
}
