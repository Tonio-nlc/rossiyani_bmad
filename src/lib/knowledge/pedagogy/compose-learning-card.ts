import {
  buildLearningCardEncounter,
  buildLearningCardHeader,
  buildLearningCardNextForms,
  buildLearningCardTakeaways,
  buildLearningCardUnderstanding,
} from "@/lib/knowledge/pedagogy/build-essential";
import { buildLearningCardExamples } from "@/lib/knowledge/pedagogy/build-intermediate";
import { buildLearningCardReference } from "@/lib/knowledge/pedagogy/build-reference";
import type { TLearningCard } from "@/types/learning-card";
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

export function composeLearningCard(
  input: TComposeLearningCardInput,
): TLearningCard {
  return {
    header: buildLearningCardHeader(
      input.displayLemma,
      input.translation,
      input.profile,
    ),
    encounter: buildLearningCardEncounter(
      input.encounter,
      input.profile,
      input.displayLemma,
    ),
    understanding: buildLearningCardUnderstanding(
      input.encounter,
      input.profile,
    ),
    takeaways: buildLearningCardTakeaways(input.profile),
    nextForms: buildLearningCardNextForms(input.profile),
    examples: buildLearningCardExamples(input.examples),
    reference: buildLearningCardReference(input.profile),
  };
}
