import type {
  TLinguisticKnowledge,
  TKnowledgeUpsertInput,
} from "@/types/knowledge";
import {
  KNOWLEDGE_PROFILE_VERSION,
  EMPTY_KNOWLEDGE_MORPHOLOGY,
  EMPTY_KNOWLEDGE_PARADIGMS,
  EMPTY_KNOWLEDGE_PEDAGOGY,
  EMPTY_KNOWLEDGE_SEMANTICS,
  EMPTY_KNOWLEDGE_SYNTAX,
} from "@/types/knowledge";
import {
  mapKnowledgeRow,
  type LinguisticKnowledgeRow,
} from "@/lib/knowledge/types";
import { createAdminClient } from "@/lib/supabase/admin";

function toDbPayload(input: TKnowledgeUpsertInput) {
  return {
    lemma_id: input.lemmaId,
    part_of_speech: input.partOfSpeech ?? null,
    gender: input.gender ?? null,
    aspect: input.aspect ?? null,
    stress: input.stress ?? null,
    movement_type: input.movementType ?? null,
    government: input.government ?? null,
    semantic_category: input.semanticCategory ?? null,
    frequency_rank: input.frequencyRank ?? null,
    register: input.register ?? null,
    difficulty: input.difficulty ?? null,
    tags: input.tags ?? [],
    notes: input.notes ?? null,
    generated_by: input.generatedBy ?? null,
    validated: input.validated ?? false,
    morphology: input.morphology ?? EMPTY_KNOWLEDGE_MORPHOLOGY,
    syntax: input.syntax ?? EMPTY_KNOWLEDGE_SYNTAX,
    semantics: input.semantics ?? EMPTY_KNOWLEDGE_SEMANTICS,
    pedagogy: input.pedagogy ?? EMPTY_KNOWLEDGE_PEDAGOGY,
    paradigms: input.paradigms ?? EMPTY_KNOWLEDGE_PARADIGMS,
    profile_version: input.profileVersion ?? 1,
    updated_at: new Date().toISOString(),
  };
}

export async function upsertKnowledge(
  input: TKnowledgeUpsertInput,
): Promise<TLinguisticKnowledge> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("linguistic_knowledge")
    .upsert(toDbPayload(input), { onConflict: "lemma_id" })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Impossible d'enregistrer la connaissance");
  }

  return mapKnowledgeRow(data as LinguisticKnowledgeRow);
}

export async function createEmptyKnowledge(
  lemmaId: string,
): Promise<TLinguisticKnowledge> {
  return upsertKnowledge({ lemmaId });
}

export function buildUpsertFromLlmPayload(
  lemmaId: string,
  generated: import("@/types/knowledge").TKnowledgeLlmPayload,
) {
  const government = JSON.stringify(
    generated.syntax.government?.length
      ? generated.syntax.government
      : generated.government,
  );

  return {
    lemmaId,
    partOfSpeech: generated.partOfSpeech,
    gender: generated.gender,
    aspect: generated.aspect ?? generated.morphology.aspect ?? null,
    movementType:
      generated.movementType ?? generated.morphology.movementType ?? null,
    government,
    semanticCategory:
      generated.semanticCategory ??
      generated.semantics.semanticCategory ??
      null,
    register: generated.register ?? generated.semantics.register ?? null,
    difficulty: generated.pedagogy.progression ?? generated.difficulty,
    notes: generated.pedagogy.takeaway ?? generated.notes ?? null,
    tags: [
      ...generated.tags,
      ...(generated.pedagogy.relatedConcepts ?? []),
    ].filter((tag, index, array) => array.indexOf(tag) === index),
    morphology: generated.morphology,
    syntax: generated.syntax,
    semantics: generated.semantics,
    pedagogy: generated.pedagogy,
    paradigms: generated.paradigms,
    generatedBy: "llm" as const,
    validated: true,
    profileVersion: KNOWLEDGE_PROFILE_VERSION,
  };
}
