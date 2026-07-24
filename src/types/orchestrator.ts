export interface TWordExplanationRequest {
  surface: string;
  sentence: string;
  textId?: string;
}

export interface TWordExplanationResponse {
  surface: string;
  lemma: string;
  lemmaStressed?: string;
  translation: string;
  functionalRole: string;
  functionColor: string;
  explanation: string;
  suffix: string;
  suffixExplanation: string;
  source: "api" | "proprio";
  confidenceScore: number;
  lemmaId?: string;
  explanationCacheId?: string;
  conceptId?: string;
  conceptSlug?: string;
  conceptTitle?: string;
  conceptSummary?: string;
  /** Régence détectée — pour l'illustration du concept (Reader). */
  conceptPreposition?: string;
  conceptGovernedCase?: string;
  /** Depuis linguistic_knowledge — pas d'heuristique LLM. */
  partOfSpeech?: string | null;
  aspect?: string | null;
}

export type TFunctionalRole =
  | "subject"
  | "object_direct"
  | "object_indirect"
  | "possession"
  | "location"
  | "time"
  | "manner";

export type TFunctionColor = "blue" | "coral" | "green" | "violet" | "amber";
