import type { TKnowledgePartOfSpeech } from "@/types/knowledge";

export type TPosStrategyId = TKnowledgePartOfSpeech | "unknown";

export interface TPedagogicalStrategy {
  id: TPosStrategyId;
  /** Titres de blocs référence autorisés (vide = tout sauf interdits) */
  allowedReferenceSections: string[];
  forbiddenReferenceSections: string[];
  /** Motifs interdits dans chips, labels, texte visible */
  forbiddenLabelPatterns: RegExp[];
  /** Champs morphology interdits */
  forbiddenMorphologyFields: string[];
  /** Motifs interdits dans nextForms hints */
  forbiddenNextFormPatterns: RegExp[];
}

export interface TIntegrityIssue {
  code: string;
  message: string;
  field?: string;
  severity: "error" | "warning";
}

export interface TIntegrityReport {
  valid: boolean;
  issues: TIntegrityIssue[];
}
