import type { TLearningCardExample, TLearningCardHeader, TLearningCardReference } from "@/types/learning-card";

export interface TCognitiveStep {
  question: string;
  answer: string;
}

export interface TWhatIfComparison {
  fromForm: string;
  toForm: string;
  explanation: string;
}

export interface TFormProgressionItem {
  form: string;
  hint: string | null;
}

export interface TLearningStorySteps {
  whyThisForm: TCognitiveStep;
  russianExpresses: TCognitiveStep;
  visibleSignal: TCognitiveStep;
  whatIf: TWhatIfComparison[];
  remember: {
    question: string;
    points: string[];
  };
}

export interface TLearningStory {
  header: TLearningCardHeader;
  surface: string | null;
  lemma: string;
  sentence: string | null;
  steps: TLearningStorySteps;
  formProgression: TFormProgressionItem[];
  examples: TLearningCardExample[];
  reference: TLearningCardReference;
}
