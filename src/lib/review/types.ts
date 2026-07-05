import { extractTranslation } from "@/lib/vocabulary/extract-translation";

export interface TReviewQueueItem {
  userVocabularyId: string;
  lemmaId: string;
  lemma: string;
  translation: string;
  nextReviewAt: string;
  savedAt: string;
}

export interface TReviewCount {
  due: number;
}

export interface TReviewQueueResponse {
  due: number;
  queue: TReviewQueueItem[];
}

export interface TReviewSessionKnowledge {
  partOfSpeech: string | null;
  gender: string | null;
  aspect: string | null;
}

export interface TReviewSessionItem extends TReviewQueueItem {
  knowledge: TReviewSessionKnowledge | null;
}

export interface TReviewSessionProgress {
  current: number;
  total: number;
  percentage: number;
}

interface ReviewQueueRow {
  id: string;
  lemma_id: string;
  saved_at: string;
  lemmas: { form: string } | { form: string }[] | null;
  explanation_cache:
    | { explanation_fr: string }
    | { explanation_fr: string }[]
    | null;
  srs_reviews:
    | { next_review_at: string }
    | { next_review_at: string }[]
    | null;
}

export function mapReviewQueueRow(row: ReviewQueueRow): TReviewQueueItem | null {
  const srsRelation = row.srs_reviews;
  const srsReview = Array.isArray(srsRelation) ? srsRelation[0] : srsRelation;

  if (!srsReview?.next_review_at) {
    return null;
  }

  const lemmaRelation = row.lemmas;
  const lemmaForm = Array.isArray(lemmaRelation)
    ? lemmaRelation[0]?.form
    : lemmaRelation?.form;

  const cacheRelation = row.explanation_cache;
  const explanationFr = Array.isArray(cacheRelation)
    ? cacheRelation[0]?.explanation_fr
    : cacheRelation?.explanation_fr;

  return {
    userVocabularyId: row.id,
    lemmaId: row.lemma_id,
    lemma: lemmaForm ?? "",
    translation: extractTranslation(explanationFr),
    nextReviewAt: srsReview.next_review_at,
    savedAt: row.saved_at,
  };
}

export function sortReviewQueue(items: TReviewQueueItem[]): TReviewQueueItem[] {
  return [...items].sort((left, right) => {
    const nextReviewCompare =
      new Date(left.nextReviewAt).getTime() -
      new Date(right.nextReviewAt).getTime();

    if (nextReviewCompare !== 0) {
      return nextReviewCompare;
    }

    return new Date(left.savedAt).getTime() - new Date(right.savedAt).getTime();
  });
}

export function isReviewDue(nextReviewAt: string, now = new Date()): boolean {
  return new Date(nextReviewAt) <= now;
}
