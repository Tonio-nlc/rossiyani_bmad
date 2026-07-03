import type { TLinguisticKnowledge } from "@/types/knowledge";

export interface LinguisticKnowledgeRow {
  id: string;
  lemma_id: string;
  part_of_speech: string | null;
  gender: string | null;
  aspect: string | null;
  stress: string | null;
  movement_type: string | null;
  government: string | null;
  semantic_category: string | null;
  frequency_rank: number | null;
  register: string | null;
  difficulty: string | null;
  tags: string[] | null;
  notes: string | null;
  generated_by: string | null;
  validated: boolean;
  created_at: string;
  updated_at: string;
}

export function mapKnowledgeRow(row: LinguisticKnowledgeRow): TLinguisticKnowledge {
  return {
    id: row.id,
    lemmaId: row.lemma_id,
    partOfSpeech: row.part_of_speech,
    gender: row.gender,
    aspect: row.aspect,
    stress: row.stress,
    movementType: row.movement_type,
    government: row.government,
    semanticCategory: row.semantic_category,
    frequencyRank: row.frequency_rank,
    register: row.register,
    difficulty: row.difficulty,
    tags: Array.isArray(row.tags) ? row.tags : [],
    notes: row.notes,
    generatedBy: row.generated_by,
    validated: row.validated,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
