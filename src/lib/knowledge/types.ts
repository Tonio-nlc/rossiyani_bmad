import type {
  TKnowledgeMorphology,
  TKnowledgeParadigms,
  TKnowledgePedagogy,
  TKnowledgeSemantics,
  TKnowledgeSyntax,
  TLinguisticKnowledge,
} from "@/types/knowledge";
import {
  EMPTY_KNOWLEDGE_MORPHOLOGY,
  EMPTY_KNOWLEDGE_PARADIGMS,
  EMPTY_KNOWLEDGE_PEDAGOGY,
  EMPTY_KNOWLEDGE_SEMANTICS,
  EMPTY_KNOWLEDGE_SYNTAX,
} from "@/types/knowledge";

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
  morphology: TKnowledgeMorphology | null;
  syntax: TKnowledgeSyntax | null;
  semantics: TKnowledgeSemantics | null;
  pedagogy: TKnowledgePedagogy | null;
  paradigms: TKnowledgeParadigms | null;
  profile_version: number | null;
  created_at: string;
  updated_at: string;
}

function parseJsonObject<T extends object>(value: unknown, fallback: T): T {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as T;
  }

  return fallback;
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
    morphology: parseJsonObject(row.morphology, EMPTY_KNOWLEDGE_MORPHOLOGY),
    syntax: parseJsonObject(row.syntax, EMPTY_KNOWLEDGE_SYNTAX),
    semantics: parseJsonObject(row.semantics, EMPTY_KNOWLEDGE_SEMANTICS),
    pedagogy: parseJsonObject(row.pedagogy, EMPTY_KNOWLEDGE_PEDAGOGY),
    paradigms: parseJsonObject(row.paradigms, EMPTY_KNOWLEDGE_PARADIGMS),
    profileVersion: row.profile_version ?? 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
