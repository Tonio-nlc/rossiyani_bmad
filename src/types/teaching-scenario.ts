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

/**
 * Contenu officiel d'enseignement — géométrie variable (RC-026+).
 *
 * Obligatoires : fact, contrast, memoryAnchor.
 * Conditionnels : omis s'il n'y a rien de solide à dire.
 *
 * Alias legacy (seeds) : explanation → fact, comparison → contrast.
 */
export interface TTeachingScenarioContent {
  /** LE fait — une phrase concrète et nommée (ex. "-ешь = 2e personne…"). */
  fact?: string;
  /** Contraste minimal, un seul axe. */
  contrast?: TTeachingComparison[];
  /** Reformule le fact — pas une métaphore neuve. */
  memoryAnchor: string;

  hook?: string;
  hookWithSurface?: string;
  /** Titre / question d'ouverture (optionnel). */
  question?: string;
  intuition?: string;
  visual?: TTeachingVisual | null;
  commonMistake?: string;
  reuse?: string[];

  /**
   * @deprecated Prefer `fact`. Kept for seed compatibility until seeds are rewritten.
   */
  explanation?: string[];
  /**
   * @deprecated Prefer `contrast`. Kept for seed compatibility until seeds are rewritten.
   */
  comparison?: TTeachingComparison[];
}

/**
 * Scénario prêt pour l'affichage — slots absents = non rendus.
 */
export interface TTeachingScenario {
  conceptId: string;
  conceptSlug: string;
  conceptTitle: string;
  encounteredForm: string | null;
  fact: string;
  contrast: TTeachingComparison[];
  memoryAnchor: string;
  hook?: string;
  question?: string;
  intuition?: string;
  visual?: TTeachingVisual | null;
  commonMistake?: string;
  reuse?: string[];
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
