export interface TSentenceBuilderCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

export interface TSentenceBuilderResult {
  isCorrect: boolean;
  positives: string[];
  corrections: TSentenceBuilderCorrection[];
  correctedSentence: string;
  explanation: string;
}

export interface TSentenceBuilderRequest {
  idea: string;
  sentence: string;
}

export interface TContextTranslationResult {
  naturalTranslation: string;
  explanation: string;
  literalTranslation: string;
  literalNote: string;
  examples: string[];
  registerNote: string | null;
}

export type TTranslationRegister =
  | "courant"
  | "soutenu"
  | "familier"
  | "argotique";

export interface TContextTranslationRequest {
  text: string;
  register: TTranslationRegister;
}
