import { ratingToSm2Quality, type TReviewRating } from "@/lib/review/rating";
import { calculateNextReview } from "@/lib/utils/srs";
import { createClient } from "@/lib/supabase/server";

interface SrsReviewRow {
  id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
}

export async function applySrsFromRating(
  userId: string,
  userVocabularyId: string,
  rating: TReviewRating,
): Promise<void> {
  const supabase = await createClient();
  const quality = ratingToSm2Quality(rating);

  const { data: vocabulary, error: vocabularyError } = await supabase
    .from("user_vocabulary")
    .select("id")
    .eq("id", userVocabularyId)
    .eq("user_id", userId)
    .maybeSingle();

  if (vocabularyError) {
    throw new Error(vocabularyError.message);
  }

  if (!vocabulary) {
    throw new Error("Mot introuvable dans votre vocabulaire");
  }

  const { data: srsRow, error: srsError } = await supabase
    .from("srs_reviews")
    .select("id, ease_factor, interval_days, repetitions")
    .eq("user_vocabulary_id", userVocabularyId)
    .maybeSingle();

  if (srsError) {
    throw new Error(srsError.message);
  }

  if (!srsRow) {
    throw new Error("Entrée SRS introuvable pour ce mot");
  }

  const current = srsRow as SrsReviewRow;
  const result = calculateNextReview({
    quality,
    easeFactor: current.ease_factor,
    intervalDays: current.interval_days,
    repetitions: current.repetitions,
  });

  const { error: updateError } = await supabase
    .from("srs_reviews")
    .update({
      ease_factor: result.easeFactor,
      interval_days: result.intervalDays,
      repetitions: result.repetitions,
      next_review_at: result.nextReviewAt.toISOString(),
      last_review_at: new Date().toISOString(),
      last_quality: quality,
    })
    .eq("id", current.id);

  if (updateError) {
    throw new Error(updateError.message);
  }
}
