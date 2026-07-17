export interface TTeachingComparison {
  fromForm: string;
  toForm: string;
  explanation?: string;
}

export interface TTeachingVisual {
  nodes: string[];
  layout?: "vertical" | "horizontal" | "comparison";
  caption?: string;
}

export interface TTeachingNextConcept {
  id: string;
  slug: string;
  title: string;
}

/** Contenu officiel d'enseignement — indépendant du lemme et du LLM */
export interface TTeachingScenarioContent {
  hook: string;
  hookWithSurface?: string;
  question: string;
  intuition: string;
  visual: TTeachingVisual;
  explanation: string[];
  comparison: TTeachingComparison[];
  commonMistake: string;
  reuse: string[];
  memoryAnchor: string;
}

/** Scénario complet prêt pour l'affichage */
export interface TTeachingScenario {
  conceptId: string;
  conceptSlug: string;
  conceptTitle: string;
  hook: string;
  question: string;
  intuition: string;
  visual: TTeachingVisual;
  explanation: string[];
  comparison: TTeachingComparison[];
  commonMistake: string;
  reuse: string[];
  memoryAnchor: string;
  nextConcept: TTeachingNextConcept | null;
}

export interface TTeachingScenarioIssue {
  severity: "error" | "warning";
  code: string;
  message: string;
  field?: string;
}

export interface TTeachingScenarioQualityReport {
  valid: boolean;
  issues: TTeachingScenarioIssue[];
}
