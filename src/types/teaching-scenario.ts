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

/** Phrase d'origine liée (explanation_cache) — carte d'exemple de rencontre. */
export interface TTeachingEncounterExample {
  sentence: string;
  /** Raison du choix de la forme (explication contextuelle). */
  note?: string;
  surface: string;
}

/**
 * Contenu officiel d'enseignement — géométrie variable (RC-026+).
 *
 * Obligatoires : fact, contrast, memoryAnchor.
 * Conditionnels : omis s'il n'y a rien de solide à dire.
 * Le bridge n'est PAS dans le seed : composé dynamiquement à l'application.
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
 * `bridge` : conditionnel — seulement s'il y a une forme rencontrée réelle.
 */
export interface TTeachingScenario {
  conceptId: string;
  conceptSlug: string;
  conceptTitle: string;
  encounteredForm: string | null;
  /**
   * Applique le concept à la forme rencontrée.
   * Absent si pas de rencontre exploitable — ne pas inventer un bridge creux.
   */
  bridge?: string;
  /** Phrase d'origine + raison — omis si pas de cache de rencontre. */
  encounterExample: TTeachingEncounterExample | null;
  fact: string;
  contrast: TTeachingComparison[];
  memoryAnchor: string;
  /** false si memoryAnchor duplique fact — section « À retenir » omise. */
  showMemoryAnchor: boolean;
  /** true si l'exemple contraste illustre le CONCEPT, pas le lemme consulté. */
  contrastIsCanonical: boolean;
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
