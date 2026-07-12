export type TKnowledgeIssueSeverity = "error" | "warning";

export type TKnowledgeQualityStatus =
  | "excellent"
  | "good"
  | "review"
  | "poor";

export interface TKnowledgeIssue {
  severity: TKnowledgeIssueSeverity;
  code: string;
  message: string;
  field?: string;
}

export interface TKnowledgeQualityStats {
  takeaways: number;
  examples: number;
  nextForms: number;
  paradigms: number;
  collocations: number;
}

export interface TKnowledgeQualityReport {
  score: number;
  status: TKnowledgeQualityStatus;
  issues: TKnowledgeIssue[];
  warnings: string[];
  stats: TKnowledgeQualityStats;
}

export interface TKnowledgeQualityInput {
  lemmaForm: string;
  payload: import("@/types/knowledge").TKnowledgeLlmPayload;
}

export interface TKnowledgeQualityCategoryScores {
  completeness: number;
  pedagogy: number;
  relevance: number;
  readability: number;
  reference: number;
}

export interface TKnowledgeQualityLemmaEntry {
  form: string;
  lemmaId?: string;
  score: number;
  status: TKnowledgeQualityStatus;
  report: TKnowledgeQualityReport;
}

export interface TKnowledgeQualityAggregateReport {
  generatedAt: string;
  totalLemmas: number;
  averageScore: number;
  byStatus: {
    excellent: number;
    good: number;
    review: number;
    poor: number;
  };
  entries: TKnowledgeQualityLemmaEntry[];
}
