import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const saveSchema = z.object({
  lemmaId: z.string().uuid(),
  explanationCacheId: z.string().uuid().optional(),
  textId: z.string().uuid().optional(),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_vocabulary")
    .select("lemma_id")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    lemmaIds: data.map((item) => item.lemma_id),
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = saveSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Corps de requête invalide" },
      { status: 400 },
    );
  }

  const { lemmaId, explanationCacheId, textId } = parsed.data;

  const { data: vocabulary, error: vocabularyError } = await supabase
    .from("user_vocabulary")
    .upsert(
      {
        user_id: user.id,
        lemma_id: lemmaId,
        explanation_cache_id: explanationCacheId ?? null,
        text_id: textId ?? null,
      },
      { onConflict: "user_id,lemma_id" },
    )
    .select("id")
    .single();

  if (vocabularyError || !vocabulary) {
    return NextResponse.json(
      { error: vocabularyError?.message ?? "Impossible de sauvegarder le mot" },
      { status: 500 },
    );
  }

  const { data: existingReview } = await supabase
    .from("srs_reviews")
    .select("id")
    .eq("user_vocabulary_id", vocabulary.id)
    .maybeSingle();

  if (!existingReview) {
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + 1);

    await supabase.from("srs_reviews").insert({
      user_vocabulary_id: vocabulary.id,
      next_review_at: nextReviewAt.toISOString(),
    });
  }

  return NextResponse.json({
    success: true,
    userVocabularyId: vocabulary.id,
  });
}
