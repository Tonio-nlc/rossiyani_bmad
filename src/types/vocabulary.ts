export type TVocabularyReviewStatus = "new" | "due" | "learned";

export interface TVocabularyListItem {
  id: string;
  lemma: string;
  translation: string;
  createdAt: string;
  reviewStatus: TVocabularyReviewStatus;
  nextReviewAt: string | null;
}

export type TVocabularyFilter = "all" | "due" | "new" | "learned";
