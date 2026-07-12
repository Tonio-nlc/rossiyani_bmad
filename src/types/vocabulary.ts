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

export interface TVocabularyLinguisticProfile {
  lemma: string;
  displayLemma: string;
  translation: string;
  partOfSpeech: string | null;
  gender: string | null;
  aspect: string | null;
  movementType: string | null;
  government: string[];
  register: string | null;
  semanticCategory: string | null;
  notes: string | null;
  tags: string[];
}

export interface TVocabularyContextEncounter {
  surface: string;
  sentence: string;
  explanation: string;
  suffix: string;
  suffixExplanation: string;
  functionalRole: string;
  functionColor: string | null;
  roleLabel: string;
}

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
  displayLemma: string;
  translation: string;
  linguisticProfile: TVocabularyLinguisticProfile;
  contextEncounter: TVocabularyContextEncounter | null;
  linguisticData: TVocabularyLinguisticData;
  userVocabulary: TVocabularyUserRecord;
  review: TVocabularyReviewInfo | null;
  examples: TVocabularyExample[];
}
