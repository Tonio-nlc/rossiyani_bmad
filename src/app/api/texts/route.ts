import { NextResponse } from "next/server";
import { z } from "zod";

import { LEVEL_ORDER } from "@/lib/library/collections";
import { createClient } from "@/lib/supabase/server";
import type { TTextWithProgress, TUserProgress } from "@/types/reader";

const querySchema = z.object({
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
  collection: z.string().min(1).optional(),
});

interface TextRow {
  id: string;
  title: string;
  content: string;
  content_annotated: TTextWithProgress["contentAnnotated"];
  level: TTextWithProgress["level"];
  collection: string | null;
  word_count: number | null;
  reading_time_minutes: number | null;
  source: string | null;
  created_at: string;
}

interface ProgressRow {
  text_id: string;
  percent_read: number;
  last_sentence_index: number;
  completed_at: string | null;
}

function mapTextRow(
  text: TextRow,
  userProgress: TUserProgress | null,
): TTextWithProgress {
  return {
    id: text.id,
    title: text.title,
    content: text.content,
    contentAnnotated: text.content_annotated,
    level: text.level,
    collection: text.collection ?? "",
    wordCount: text.word_count ?? 0,
    readingTimeMinutes: text.reading_time_minutes ?? 0,
    userProgress,
  };
}

function isInProgress(userProgress: TUserProgress | null): boolean {
  return (
    userProgress !== null &&
    userProgress.percentRead > 0 &&
    userProgress.completedAt === null
  );
}

function sortTexts(texts: TTextWithProgress[]): TTextWithProgress[] {
  return [...texts].sort((a, b) => {
    const aInProgress = isInProgress(a.userProgress);
    const bInProgress = isInProgress(b.userProgress);

    if (aInProgress && !bInProgress) {
      return -1;
    }

    if (!aInProgress && bInProgress) {
      return 1;
    }

    return (
      LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level)
    );
  });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsedQuery = querySchema.safeParse({
    level: searchParams.get("level") ?? undefined,
    collection: searchParams.get("collection") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: "Paramètres de requête invalides" },
      { status: 400 },
    );
  }

  let textsQuery = supabase.from("texts").select("*");

  if (parsedQuery.data.level) {
    textsQuery = textsQuery.eq("level", parsedQuery.data.level);
  }

  if (parsedQuery.data.collection) {
    textsQuery = textsQuery.eq("collection", parsedQuery.data.collection);
  }

  const { data: texts, error: textsError } = await textsQuery;

  if (textsError) {
    return NextResponse.json({ error: textsError.message }, { status: 500 });
  }

  const { data: progressList, error: progressError } = await supabase
    .from("user_progress")
    .select("text_id, percent_read, last_sentence_index, completed_at")
    .eq("user_id", user.id);

  if (progressError) {
    return NextResponse.json({ error: progressError.message }, { status: 500 });
  }

  const progressMap = new Map<string, TUserProgress>(
    (progressList as ProgressRow[] | null)?.map((progress) => [
      progress.text_id,
      {
        percentRead: progress.percent_read,
        lastSentenceIndex: progress.last_sentence_index,
        completedAt: progress.completed_at,
      },
    ]) ?? [],
  );

  const enrichedTexts = (texts as TextRow[]).map((text) =>
    mapTextRow(text, progressMap.get(text.id) ?? null),
  );

  return NextResponse.json(sortTexts(enrichedTexts));
}
