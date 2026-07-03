export type TKnowledgeDifficulty = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type TKnowledgeGeneratedBy = "manual" | "llm" | "import" | "migration";

export type TKnowledgePartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "preposition"
  | "conjunction"
  | "pronoun"
  | "particle";

export type TKnowledgeGender = "m" | "f" | "n";

export type TKnowledgeAspect = "imperfective" | "perfective";

export interface TLinguisticKnowledge {
  id: string;
  lemmaId: string;
  partOfSpeech: TKnowledgePartOfSpeech | string | null;
  gender: TKnowledgeGender | string | null;
  aspect: TKnowledgeAspect | string | null;
  stress: string | null;
  movementType: string | null;
  government: string | null;
  semanticCategory: string | null;
  frequencyRank: number | null;
  register: string | null;
  difficulty: TKnowledgeDifficulty | string | null;
  tags: string[];
  notes: string | null;
  generatedBy: TKnowledgeGeneratedBy | string | null;
  validated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TKnowledgeUpsertInput {
  lemmaId: string;
  partOfSpeech?: string | null;
  gender?: string | null;
  aspect?: string | null;
  stress?: string | null;
  movementType?: string | null;
  government?: string | null;
  semanticCategory?: string | null;
  frequencyRank?: number | null;
  register?: string | null;
  difficulty?: string | null;
  tags?: string[];
  notes?: string | null;
  generatedBy?: string | null;
  validated?: boolean;
}

export interface TKnowledgeLlmPayload {
  partOfSpeech: string;
  gender: TKnowledgeGender | null;
  aspect: TKnowledgeAspect | null;
  movementType: string | null;
  government: string[];
  semanticCategory: string | null;
  register: string | null;
  difficulty: string;
  notes: string;
  tags: string[];
}
