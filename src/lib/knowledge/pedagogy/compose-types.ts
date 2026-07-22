import type {
  TVocabularyContextEncounter,
  TVocabularyExample,
  TVocabularyLinguisticProfile,
} from "@/types/vocabulary";
import type { TTeachingScenario } from "@/types/teaching-scenario";

export interface TComposeLearningCardInput {
  profile: TVocabularyLinguisticProfile;
  displayLemma: string;
  translation: string | null;
  encounter: TVocabularyContextEncounter | null;
  examples: TVocabularyExample[];
  /** Scénario composé à l'enregistrement — prioritaire sur le recalcul. */
  persistedTeachingScenario?: TTeachingScenario | null;
}
