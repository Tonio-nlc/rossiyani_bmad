import { splitPedagogicalBlocks } from "@/lib/knowledge/pedagogy/build-essential";
import { composeLearningCard } from "@/lib/knowledge/pedagogy/compose-learning-card";
import { composeConceptLesson } from "@/lib/knowledge/concept/compose-concept-lesson";
import { composeTeachingStory } from "@/lib/knowledge/teaching/compose-teaching-story";
import type {
  TVocabularyContextEncounter,
  TVocabularyExample,
  TVocabularyLinguisticProfile,
} from "@/types/vocabulary";
import type { TConceptLesson } from "@/types/concept-lesson";
import type { TLearningCard } from "@/types/learning-card";
import type { TLearningStory } from "@/types/learning-story";

export type { TProfileExploreBlock as TExploreBlock } from "@/lib/knowledge/profile-views";
export { splitPedagogicalBlocks };

export function composeVocabularyLearningCard(input: {
  profile: TVocabularyLinguisticProfile;
  displayLemma: string;
  translation: string | null;
  encounter: TVocabularyContextEncounter | null;
  examples: TVocabularyExample[];
}): TLearningCard {
  return composeLearningCard({
    ...input,
    translation: input.translation ?? "",
  });
}

export function composeVocabularyConceptLesson(input: {
  profile: TVocabularyLinguisticProfile;
  displayLemma: string;
  translation: string | null;
  encounter: TVocabularyContextEncounter | null;
  examples: TVocabularyExample[];
}): TConceptLesson {
  return composeConceptLesson({
    ...input,
    translation: input.translation ?? "",
  }).lesson;
}

/** @deprecated Préférer composeVocabularyConceptLesson */
export function composeVocabularyLearningStory(input: {
  profile: TVocabularyLinguisticProfile;
  displayLemma: string;
  translation: string | null;
  encounter: TVocabularyContextEncounter | null;
  examples: TVocabularyExample[];
}): TLearningStory {
  return composeTeachingStory({
    ...input,
    translation: input.translation ?? "",
  }).story;
}
