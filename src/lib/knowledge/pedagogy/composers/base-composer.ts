import {
  buildLearningCardEncounter,
  buildLearningCardHeader,
  buildLearningCardNextForms,
  buildLearningCardTakeaways,
  buildLearningCardUnderstanding,
} from "@/lib/knowledge/pedagogy/build-essential";
import { buildLearningCardExamples } from "@/lib/knowledge/pedagogy/build-intermediate";
import { buildLearningCardReference } from "@/lib/knowledge/pedagogy/build-reference";
import type { TComposeLearningCardInput } from "@/lib/knowledge/pedagogy/compose-types";
import type { TLearningCard } from "@/types/learning-card";

export function buildRawLearningCard(
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
