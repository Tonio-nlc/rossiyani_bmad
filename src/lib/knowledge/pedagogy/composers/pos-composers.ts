import { composeWithStrategy } from "@/lib/knowledge/pedagogy/composers/compose-with-strategy";
import type { TComposeLearningCardInput } from "@/lib/knowledge/pedagogy/compose-types";
import {
  ADJECTIVE_STRATEGY,
  ADVERB_STRATEGY,
  CONJUNCTION_STRATEGY,
  NOUN_STRATEGY,
  PARTICLE_STRATEGY,
  PREPOSITION_STRATEGY,
  PRONOUN_STRATEGY,
  VERB_STRATEGY,
} from "@/lib/knowledge/pedagogy/strategy/strategies";
import type { TLearningCard } from "@/types/learning-card";

export function composeVerbLearningCard(
  input: TComposeLearningCardInput,
): TLearningCard {
  return composeWithStrategy(input, VERB_STRATEGY);
}

export function composeNounLearningCard(
  input: TComposeLearningCardInput,
): TLearningCard {
  return composeWithStrategy(input, NOUN_STRATEGY);
}

export function composeAdjectiveLearningCard(
  input: TComposeLearningCardInput,
): TLearningCard {
  return composeWithStrategy(input, ADJECTIVE_STRATEGY);
}

export function composePronounLearningCard(
  input: TComposeLearningCardInput,
): TLearningCard {
  return composeWithStrategy(input, PRONOUN_STRATEGY);
}

export function composeAdverbLearningCard(
  input: TComposeLearningCardInput,
): TLearningCard {
  return composeWithStrategy(input, ADVERB_STRATEGY);
}

export function composePrepositionLearningCard(
  input: TComposeLearningCardInput,
): TLearningCard {
  return composeWithStrategy(input, PREPOSITION_STRATEGY);
}

export function composeConjunctionLearningCard(
  input: TComposeLearningCardInput,
): TLearningCard {
  return composeWithStrategy(input, CONJUNCTION_STRATEGY);
}

export function composeParticleLearningCard(
  input: TComposeLearningCardInput,
): TLearningCard {
  return composeWithStrategy(input, PARTICLE_STRATEGY);
}
