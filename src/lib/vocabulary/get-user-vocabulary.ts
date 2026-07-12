import type { TVocabularyListItem, TVocabularyReviewStatus } from "@/types/vocabulary";
import { extractTranslation } from "@/lib/vocabulary/extract-translation";
import { createClient } from "@/lib/supabase/server";

interface VocabularyRow {
  id: string;
  lemma_id: string;
  saved_at: string;
  lemmas: { form: string } | { form: string }[] | null;
  explanation_cache:
    | { explanation_fr: string }
    | { explanation_fr: string }[]
    | null;
  srs_reviews:
    | {
        repetitions: number;
        next_review_at: string;
      }
    | {
        repetitions: number;
        next_review_at: string;
      }[]
    | null;
}


function computeReviewStatus(
  repetitions: number,
  nextReviewAt: string | null,
): TVocabularyReviewStatus {
  if (repetitions === 0) {
    return "new";
  }

  if (nextReviewAt && new Date(nextReviewAt) <= new Date()) {
    return "due";
  }

  return "learned";
}

function mapVocabularyRow(row: VocabularyRow): TVocabularyListItem {
  const lemmaRelation = row.lemmas;
  const lemmaForm = Array.isArray(lemmaRelation)
    ? lemmaRelation[0]?.form
    : lemmaRelation?.form;

  const cacheRelation = row.explanation_cache;
  const explanationFr = Array.isArray(cacheRelation)
    ? cacheRelation[0]?.explanation_fr
    : cacheRelation?.explanation_fr;

  const srsRelation = row.srs_reviews;
  const srsReview = Array.isArray(srsRelation) ? srsRelation[0] : srsRelation;

  const nextReviewAt = srsReview?.next_review_at ?? null;

  return {
    id: row.lemma_id,
    lemma: lemmaForm ?? "",
    translation: extractTranslation(explanationFr),
    createdAt: row.saved_at,
    reviewStatus: computeReviewStatus(srsReview?.repetitions ?? 0, nextReviewAt),
    nextReviewAt,
  };
}

export async function getUserVocabulary(
  userId: string,
): Promise<TVocabularyListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_vocabulary")
    .select(
      `
      id,
      lemma_id,
      saved_at,
      lemmas ( form ),
      explanation_cache ( explanation_fr ),
      srs_reviews ( repetitions, next_review_at )
    `,
    )
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });

  if (error) {
    throw new Error("Impossible de charger le vocabulaire");
  }

  return (data as VocabularyRow[]).map(mapVocabularyRow);
}
