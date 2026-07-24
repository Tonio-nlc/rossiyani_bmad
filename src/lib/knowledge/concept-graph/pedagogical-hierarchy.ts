/**
 * Hiérarchie pédagogique de résolution de concept.
 *
 * Les scores numériques de matchConceptSignals sont un filet de sécurité ;
 * quand deux phénomènes coexistent, cette hiérarchie tranche (pas un écart
 * de 3 points entre 95 et 92).
 *
 * Ordre retenu (du plus spécifique au plus général) :
 * 1. Régence prépositionnelle (détectée) — déjà score 96
 * 2. Famille mouvement : verbs-of-motion > verb-movement-prefixes
 * 3. Conjugaison / accord / déclinaison selon POS
 * 4. Aspect (perfectif / imperfectif / paires) — secondaire si mouvement
 *
 * Voir docs/knowledge/concept-resolution-hierarchy.md
 */

import type { TLinguisticAnalysis } from "@/lib/knowledge/teaching/analyze-linguistic-context";
import { CURATED_MOTION } from "@/lib/knowledge/morphology/curated";
import type { TConceptSignalMatch } from "@/types/linguistic-concept";

/** Sous-ensemble du profil nécessaire à la hiérarchie (évite import circulaire). */
export interface THierarchyProfile {
  movementType?: string | null;
}

/** Score de rang hiérarchique — au-dessus de tout score de règle. */
export const HIERARCHY_PRIMARY_SCORE = 200;

export const MOTION_CONCEPT_IDS = [
  "verbs-of-motion",
  "verb-movement-prefixes",
] as const;

export const ASPECT_CONCEPT_IDS = [
  "verb-perfective-aspect",
  "verb-imperfective-aspect",
  "aspect-pairs",
] as const;

const ASPECT_SET = new Set<string>(ASPECT_CONCEPT_IDS);
const MOTION_SET = new Set<string>(MOTION_CONCEPT_IDS);

function stripStress(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\u0301/g, "")
    .normalize("NFC")
    .toLowerCase()
    .trim();
}

const CURATED_MOTION_LEMMAS = new Set(
  Object.values(CURATED_MOTION).map((form) => stripStress(form)),
);

/**
 * Verbe de mouvement : movementType knowledge, lemme curé, ou famille morphologique.
 */
export function isMotionVerbLemma(
  profile: THierarchyProfile,
  analysis: TLinguisticAnalysis,
): boolean {
  if (profile.movementType) {
    return true;
  }

  const lemma = stripStress(analysis.baseLemma || "");
  const surface = stripStress(analysis.surfaceForm || "");

  if (CURATED_MOTION_LEMMAS.has(lemma) || CURATED_MOTION_LEMMAS.has(surface)) {
    return true;
  }

  // Bases / préfixés de mouvement courants (pas « понять » etc.)
  return (
    /^(по|при|у|вы|пере)?(йти|идти|ходить|ехать|ездить|бежать|лететь|плыть|нести|везти)/u.test(
      lemma,
    ) || /^(ид|ход|ех|езд|бег|лет|плыв|нес|вез|полз)/u.test(lemma)
  );
}

/**
 * Quand le lemme est un verbe de mouvement :
 * - concept mouvement (préféré) ou préfixe = PRIMARY
 * - aspect = SECONDARY (concepts liés), score abaissé
 */
export function applyPedagogicalHierarchy(
  matches: TConceptSignalMatch[],
  profile: THierarchyProfile,
  analysis: TLinguisticAnalysis,
): TConceptSignalMatch[] {
  if (matches.length === 0 || !isMotionVerbLemma(profile, analysis)) {
    return matches;
  }

  const hasVerbsOfMotion = matches.some(
    (item) => item.conceptId === "verbs-of-motion",
  );
  const hasMovementPrefixes = matches.some(
    (item) => item.conceptId === "verb-movement-prefixes",
  );

  const primaryMotionId = hasVerbsOfMotion
    ? "verbs-of-motion"
    : hasMovementPrefixes
      ? "verb-movement-prefixes"
      : null;

  if (!primaryMotionId) {
    return matches;
  }

  const adjusted = matches.map((item) => {
    if (item.conceptId === primaryMotionId) {
      return {
        ...item,
        weight: "primary" as const,
        score: HIERARCHY_PRIMARY_SCORE,
        signal: `${item.signal} · hiérarchie mouvement`,
      };
    }

    if (MOTION_SET.has(item.conceptId) || ASPECT_SET.has(item.conceptId)) {
      return {
        ...item,
        weight: "secondary" as const,
        score: ASPECT_SET.has(item.conceptId)
          ? Math.min(item.score, 55)
          : Math.min(item.score, 70),
        signal: ASPECT_SET.has(item.conceptId)
          ? `${item.signal} · secondaire (sous mouvement)`
          : item.signal,
      };
    }

    return item;
  });

  return adjusted.sort((left, right) => right.score - left.score);
}

/** Écarts de scores bruts < 10 pts — fragiles sans hiérarchie. */
export const FRAGILE_SCORE_PAIRS: Array<{
  a: string;
  b: string;
  scores: [number, number];
  delta: number;
}> = [
  {
    a: "verb-perfective-aspect",
    b: "verb-movement-prefixes",
    scores: [95, 92],
    delta: 3,
  },
  {
    a: "verb-movement-prefixes",
    b: "verb-present-conjugation",
    scores: [92, 90],
    delta: 2,
  },
  {
    a: "verb-present-conjugation",
    b: "reflexive-possessive",
    scores: [90, 88],
    delta: 2,
  },
  {
    a: "verbs-of-motion",
    b: "noun-declension",
    scores: [80, 80],
    delta: 0,
  },
  {
    a: "noun-declension",
    b: "adjective-agreement",
    scores: [80, 78],
    delta: 2,
  },
];
