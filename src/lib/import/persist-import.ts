import type { SupabaseClient } from "@supabase/supabase-js";

import type { ImportPreview } from "./types";
import { validateImportLimits } from "./validate";

export interface UserImportCounts {
  userImportCount: number;
  userDailyImportCount: number;
}

export async function getUserImportCounts(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserImportCounts> {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [totalResult, dailyResult] = await Promise.all([
    supabase
      .from("texts")
      .select("*", { count: "exact", head: true })
      .eq("source", "imported")
      .eq("imported_by", userId),
    supabase
      .from("texts")
      .select("*", { count: "exact", head: true })
      .eq("source", "imported")
      .eq("imported_by", userId)
      .gte("created_at", dayAgo),
  ]);

  if (totalResult.error) {
    throw new Error(totalResult.error.message);
  }

  if (dailyResult.error) {
    throw new Error(dailyResult.error.message);
  }

  return {
    userImportCount: totalResult.count ?? 0,
    userDailyImportCount: dailyResult.count ?? 0,
  };
}

export function checkImportQuotas(
  preview: ImportPreview,
  counts: UserImportCounts,
) {
  return validateImportLimits(
    {
      wordCount: preview.wordCount,
      sentenceCount: preview.sentenceCount,
      charLength: preview.normalizedText.length,
    },
    counts,
  );
}

export async function persistImportedText(
  supabase: SupabaseClient,
  userId: string,
  title: string,
  level: ImportPreview["estimatedLevel"],
  preview: ImportPreview,
): Promise<string> {
  const { data, error } = await supabase
    .from("texts")
    .insert({
      title: title.trim(),
      content: preview.normalizedText,
      content_annotated: { sentences: preview.annotatedSentences },
      level,
      collection: "imported",
      source: "imported",
      imported_by: userId,
      word_count: preview.wordCount,
      reading_time_minutes: preview.readingTime,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.id) {
    throw new Error("Import enregistré sans identifiant retourné.");
  }

  return data.id as string;
}

export function buildReaderRedirect(textId: string): string {
  return `/reader/${textId}`;
}
