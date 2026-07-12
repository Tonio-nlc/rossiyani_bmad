export type TImportanceLevel = "CRITICAL" | "IMPORTANT" | "REFERENCE";

export interface TLearningCardHeader {
  lemma: string;
  translation: string | null;
  partOfSpeech: string | null;
  subtitle: string | null;
}

export interface TLearningCardEncounter {
  surface: string;
  formChips: string[];
  lemma: string;
  originPhrase: string;
  traitChips: string[];
}

export interface TLearningCardUnderstanding {
  intro: string | null;
  whyPoints: string[];
  suffix: string | null;
  roleLabel: string | null;
  functionColor: string | null;
  explanationBlocks: string[];
  sentence: string | null;
}

export interface TLearningCardTakeaways {
  items: string[];
}

export interface TLearningCardNextForms {
  forms: string[];
}

export interface TLearningCardExample {
  id: string;
  sentenceRu: string;
  translationFr: string | null;
  source: string | null;
  textId: string | null;
  textTitle: string | null;
}

export interface TLearningCardReferenceBlock {
  title: string;
  items: string[];
  importance: TImportanceLevel;
}

export interface TLearningCardReference {
  blocks: TLearningCardReferenceBlock[];
}

export interface TLearningCard {
  header: TLearningCardHeader;
  encounter: TLearningCardEncounter | null;
  understanding: TLearningCardUnderstanding | null;
  takeaways: TLearningCardTakeaways;
  nextForms: TLearningCardNextForms;
  examples: TLearningCardExample[];
  reference: TLearningCardReference;
}
