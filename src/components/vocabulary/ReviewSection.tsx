import { format } from "date-fns";
import { fr } from "date-fns/locale";

import type { TVocabularyReviewInfo } from "@/types/vocabulary";

interface ReviewSectionProps {
  review: TVocabularyReviewInfo | null;
}

export function ReviewSection({ review }: ReviewSectionProps) {
  if (!review || review.repetitions === 0) {
    return null;
  }

  const nextReview = format(new Date(review.nextReviewAt), "d MMMM yyyy", {
    locale: fr,
  });

  return (
    <p className="border-t border-border/60 pt-4 text-xs text-ink-3">
      Révision prévue le {nextReview} · {review.currentLevel.toLowerCase()}
    </p>
  );
}
