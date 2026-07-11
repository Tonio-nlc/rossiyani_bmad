import type { TText } from "@/types/reader";

export type TImportSource = "paste" | "txt";

export type TTextLevel = TText["level"];

export interface ImportInput {
  title?: string;
  rawText: string;
  source: TImportSource;
}

/** Phrase minimale — même contrat que content_annotated des imports (sans translationFr ni words). */
export interface TImportAnnotatedSentence {
  text: string;
}

export type ImportErrorCode =
  | "EMPTY_TEXT"
  | "TEXT_TOO_LARGE"
  | "INVALID_CHARACTERS"
  | "NOT_RUSSIAN"
  | "TOO_FEW_WORDS"
  | "TOO_MANY_WORDS"
  | "TOO_MANY_SENTENCES"
  | "IMPORT_QUOTA_EXCEEDED"
  | "DAILY_IMPORT_LIMIT_EXCEEDED";

export interface ImportError {
  code: ImportErrorCode;
  message: string;
}

export type ImportWarningCode =
  | "LOW_PUNCTUATION"
  | "LONG_SENTENCES"
  | "SHORT_TEXT"
  | "NO_FINAL_PUNCTUATION"
  | "UNUSUAL_PUNCTUATION";

export interface ImportWarning {
  code: ImportWarningCode;
  message: string;
}

export interface ImportPreview {
  detectedLanguage: string;
  isRussian: boolean;
  estimatedLevel: TTextLevel;
  sentenceCount: number;
  wordCount: number;
  readingTime: number;
  normalizedText: string;
  annotatedSentences: TImportAnnotatedSentence[];
  warnings: ImportWarning[];
}

export type AnalyzeImportResult =
  | { ok: true; preview: ImportPreview }
  | { ok: false; errors: ImportError[] };

export interface ImportStats {
  wordCount: number;
  sentenceCount: number;
  charLength: number;
}

export interface ImportLimitsOptions {
  userImportCount?: number;
  userDailyImportCount?: number;
}
