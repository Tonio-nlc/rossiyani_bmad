export type {
  TFunctionColor,
  TFunctionalRole,
  TWordExplanationRequest,
  TWordExplanationResponse,
} from "@/types/orchestrator";

export interface TLlmExplanationPayload {
  lemma: string;
  lemmaStressed?: string;
  translation: string;
  functionalRole: string;
  functionColor: string;
  explanation: string;
  suffix: string;
  suffixExplanation: string;
}

export interface TCachedExplanationPayload {
  explanation: string;
  translation: string;
  suffix: string;
  suffixExplanation: string;
  lemmaStressed?: string;
}

export interface TWordExplanationResponseExtended {
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
  lemmaId: string;
  explanationCacheId: string;
}
