import { formatPosLabel } from "@/lib/vocabulary/format-linguistic-labels";
import { composeLearningCard } from "@/lib/knowledge/pedagogy/compose-learning-card";
import { splitPedagogicalBlocks } from "@/lib/knowledge/pedagogy/build-essential";
import type {
  TVocabularyContextEncounter,
  TVocabularyExample,
  TVocabularyLinguisticProfile,
} from "@/types/vocabulary";
import type { TLearningCard } from "@/types/learning-card";

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

export function getPosLabel(
  partOfSpeech: string | null | undefined,
): string | null {
  return formatPosLabel(partOfSpeech);
}
