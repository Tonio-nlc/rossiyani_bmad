import {
  limitList,
  PEDAGOGY_LIMITS,
} from "@/lib/knowledge/pedagogy/importance-ranking";
import type { TLearningCardExample } from "@/types/learning-card";
import type { TVocabularyExample } from "@/types/vocabulary";

export function buildLearningCardExamples(
  examples: TVocabularyExample[],
): TLearningCardExample[] {
  return limitList(examples, PEDAGOGY_LIMITS.examples).map((example) => ({
    id: example.id,
    sentenceRu: example.sentenceRu,
    translationFr: example.translationFr ?? null,
    source: example.source ?? null,
    textId: example.textId ?? null,
    textTitle: example.textTitle ?? null,
  }));
}
