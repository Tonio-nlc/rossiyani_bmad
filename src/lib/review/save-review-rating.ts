import type { TReviewRating } from "@/lib/review/rating";
import { createClient } from "@/lib/supabase/server";

export async function saveReviewRating(
  userId: string,
  userVocabularyId: string,
  rating: TReviewRating,
): Promise<void> {
  const supabase = await createClient();

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

  const { error } = await supabase.from("review_history").insert({
    user_vocabulary_id: userVocabularyId,
    rating,
  });

  if (error) {
    throw new Error(error.message);
  }
}
