import type { TFunctionColor, TFunctionalRole } from "@/types/orchestrator";

export interface TText {
  id: string;
  title: string;
  content: string;
  contentAnnotated: TAnnotatedContent | null;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  collection: string;
  wordCount: number;
  readingTimeMinutes: number;
}

export interface TAnnotatedContent {
  sentences: TAnnotatedSentence[];
}

export interface TAnnotatedSentence {
  text: string;
  translationFr: string;
  words: TAnnotatedWord[];
}

export interface TAnnotatedWord {
  surface: string;
  lemmaId: string | null;
  wordFormId: string | null;
  position: number;
  functionalRole: TFunctionalRole | null;
  functionColor: TFunctionColor | null;
}

export interface TUserProgress {
  percentRead: number;
  lastSentenceIndex: number;
  completedAt: string | null;
}

export interface TTextWithProgress extends TText {
  userProgress: TUserProgress | null;
}
