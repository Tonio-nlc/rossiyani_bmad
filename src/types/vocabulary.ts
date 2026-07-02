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

export interface TVocabularyLinguisticData {
  lemma: string;
  translation: string;
  pos: string | null;
  gender: string | null;
  aspect: string | null;
  accent: string | null;
  addedAt: string;
}

export interface TVocabularyUserRecord {
  id: string;
  lemmaId: string;
  savedAt: string;
  textId: string | null;
  notes: string | null;
}

export interface TVocabularyReviewInfo {
  nextReviewAt: string;
  repetitions: number;
  currentLevel: string;
  easeFactor: number;
  intervalDays: number;
  lastReviewAt: string | null;
}

export interface TVocabularyExample {
  id: string;
  sentenceRu: string;
  translationFr: string | null;
  source: "text" | "cache";
  textId?: string;
  textTitle?: string;
}

export interface TVocabularyEntry {
  lemma: string;
  translation: string;
  linguisticData: TVocabularyLinguisticData;
  userVocabulary: TVocabularyUserRecord;
  review: TVocabularyReviewInfo | null;
  examples: TVocabularyExample[];
}
