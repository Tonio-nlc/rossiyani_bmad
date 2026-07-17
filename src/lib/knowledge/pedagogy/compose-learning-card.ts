import {
  composeAdjectiveLearningCard,
  composeAdverbLearningCard,
  composeConjunctionLearningCard,
  composeNounLearningCard,
  composeParticleLearningCard,
  composePrepositionLearningCard,
  composePronounLearningCard,
  composeVerbLearningCard,
} from "@/lib/knowledge/pedagogy/composers/pos-composers";
import { composeWithStrategy } from "@/lib/knowledge/pedagogy/composers/compose-with-strategy";
import type { TComposeLearningCardInput } from "@/lib/knowledge/pedagogy/compose-types";
import {
  getPedagogicalStrategy,
  normalizePartOfSpeech,
} from "@/lib/knowledge/pedagogy/strategy/strategies";
import type { TLearningCard } from "@/types/learning-card";

export type { TComposeLearningCardInput } from "@/lib/knowledge/pedagogy/compose-types";

export function composeLearningCard(
  input: TComposeLearningCardInput,
): TLearningCard {
  const pos = normalizePartOfSpeech(input.profile.partOfSpeech);

  switch (pos) {
    case "verb":
      return composeVerbLearningCard(input);
    case "noun":
      return composeNounLearningCard(input);
    case "adjective":
      return composeAdjectiveLearningCard(input);
    case "pronoun":
      return composePronounLearningCard(input);
    case "adverb":
      return composeAdverbLearningCard(input);
    case "preposition":
      return composePrepositionLearningCard(input);
    case "conjunction":
      return composeConjunctionLearningCard(input);
    case "particle":
      return composeParticleLearningCard(input);
    default: {
      const strategy = getPedagogicalStrategy(input.profile.partOfSpeech);
      return composeWithStrategy(input, strategy);
    }
  }
}
