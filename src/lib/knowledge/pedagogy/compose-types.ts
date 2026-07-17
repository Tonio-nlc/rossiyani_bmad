import type {
  TVocabularyContextEncounter,
  TVocabularyExample,
  TVocabularyLinguisticProfile,
} from "@/types/vocabulary";

export interface TComposeLearningCardInput {
  profile: TVocabularyLinguisticProfile;
  displayLemma: string;
  translation: string | null;
  encounter: TVocabularyContextEncounter | null;
  examples: TVocabularyExample[];
}
