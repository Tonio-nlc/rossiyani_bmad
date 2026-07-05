import type { TReviewRating } from "@/lib/review/rating";
import { applySrsFromRating } from "@/lib/review/apply-srs-from-rating";
import { saveReviewRating } from "@/lib/review/save-review-rating";

export async function processReviewRating(
  userId: string,
  userVocabularyId: string,
  rating: TReviewRating,
): Promise<void> {
  await saveReviewRating(userId, userVocabularyId, rating);
  await applySrsFromRating(userId, userVocabularyId, rating);
}
