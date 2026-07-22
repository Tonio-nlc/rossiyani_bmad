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
 * Illustration du concept avec un lemme d'exemple (ex. читать).
 * Autorisée UNIQUEMENT dans la section étiquetée « Illustration — {concept} ».
 * Ne doit jamais remplacer la démonstration du lemme consulté.
 */
export interface TTeachingIllustration {
  /** Titre court, ex. « conjugaison au présent ». */
  label?: string;
  contrast?: TTeachingComparison[];
  visual?: TTeachingVisual | null;
  commonMistake?: string;
  reuse?: string[];
  /** Fact d'exemple lié au lemme d'illustration (pas au lemme consulté). */
  fact?: string;
  memoryAnchor?: string;
}

/**
 * Contenu officiel d'enseignement — géométrie variable (RC-026+).
 *
 * Séparation principe / démonstration :
 * - `principle` (+ intuition/hook) = invariant du concept (tous les lemmes)
 * - `fact` / visual / contrast / commonMistake / reuse dans le seed =
 *   illustration canonique OU fallback si pas de forme rencontrée
 * - À l'affichage, les slots démonstratifs sont recomposés depuis le lemme
 *   consulté + la forme rencontrée (voir composeTeachingScenario)
 *
 * Obligatoires : fact (ou principle), contrast, memoryAnchor.
 * Le bridge n'est PAS dans le seed : composé dynamiquement à l'application.
 *
 * Alias legacy (seeds) : explanation → fact, comparison → contrast.
 */
export interface TTeachingScenarioContent {
  /**
   * Principe invariant du concept (RC-025).
   * Ex. : « En russe, la terminaison du verbe dit qui fait l'action, maintenant. »
   */
  principle?: string;
  /** LE fait — spécialisé sur une forme, ou principe si pas encore de démo. */
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
   * Exemple du concept avec un autre lemme — section « Illustration » uniquement.
   */
  illustration?: TTeachingIllustration;

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
  /** Lemme consulté — pour le gate anti-formes étrangères. */
  consultedLemma?: string | null;
  encounteredForm: string | null;
  /**
   * Applique le concept à la forme rencontrée.
   * Absent si pas de rencontre exploitable — ne pas inventer un bridge creux.
   */
  bridge?: string;
  /** Phrase d'origine + raison — omis si pas de cache de rencontre. */
  encounterExample: TTeachingEncounterExample | null;
  /** Principe invariant (si distinct du fact spécialisé). */
  principle?: string;
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
  /**
   * Illustration canonique (autre lemme) — affichée hors démonstration.
   * Autorisée à contenir des formes d'un lemme ≠ consulté.
   */
  illustration?: TTeachingIllustration | null;
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
