import type {
  TLinguisticKnowledge,
  TKnowledgeUpsertInput,
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
