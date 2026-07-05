export type TReviewRating = "again" | "hard" | "good" | "easy";

export const REVIEW_RATINGS: TReviewRating[] = [
  "again",
  "hard",
  "good",
  "easy",
];

export const REVIEW_RATING_LABELS: Record<TReviewRating, string> = {
  again: "Again",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
};

/** Convertit une réponse utilisateur en score SM-2 (0-5). */
export function ratingToSm2Quality(rating: TReviewRating): number {
  switch (rating) {
    case "again":
      return 1;
    case "hard":
      return 3;
    case "good":
      return 4;
    case "easy":
      return 5;
  }
}
