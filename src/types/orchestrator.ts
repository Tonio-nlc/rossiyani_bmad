export interface TWordExplanationRequest {
  surface: string;
  sentence: string;
  textId?: string;
}

export interface TWordExplanationResponse {
  surface: string;
  lemma: string;
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
